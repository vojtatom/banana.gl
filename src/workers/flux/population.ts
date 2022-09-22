import axios from "axios";
import { colorStrToArr } from "../../style/color";
import { PopulationData, NetworkData } from "./dataInterface";


export async function loadPopulation(api: string[]) {
    console.log('loading population');
    const { population, network } = await fetchData(api);
    console.log('loaded');

    const timestamps = extractTimestamps(population);
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);
    const { positions, colors } = agentMovementGeometry(population, sortedTimestamps, network);

    return {
        positions: positions,
        timestamps: new Float32Array(sortedTimestamps),
        colors: new Float32Array(colors.flat()),
    }
}

async function fetchData(api: string[]) {
    const [populationAPI, networkAPI] = api;
    //const pdata = await axios.get(populationAPI, { onDownloadProgress: (e) => console.log(e.loaded) });
    const ndata = await fetch(networkAPI);
    const pdata = await fetch(populationAPI);

    console.log('fetched');
    const population = await pdata.json() as PopulationData;
    console.log(population);
    const network = await ndata.json() as NetworkData;
    return { population: population, network: network };
}

function agentMovementGeometry(population: PopulationData, sortedTimestamps: number[], network: NetworkData) {
    const timeline = [];
    const colors: number[][] = [];
    for (let agentID in population.data.agents) {
        const agentTimeline = processAgent(population, agentID, colors, sortedTimestamps, network);
        timeline.push(agentTimeline);
    }

    const positions = invertTimelineToTimeMajor(timeline);
    return { positions, colors };
}

function invertTimelineToTimeMajor(timeline: number[][]) {
    const positions = [];
    for (let i = 0; i < timeline[0].length; i += 3) {
        const row = [];
        for (let j = 0; j < timeline.length; j++) {
            row.push(timeline[j][i], timeline[j][i + 1], timeline[j][i + 2]);
        }
        positions.push(new Float32Array(row));
    }
    return positions;
}

function processAgent(population: PopulationData, agentID: string, colors: number[][], sortedTimestamps: number[], network: NetworkData) {
    const agentTimeline = [];
    const agent = population.data.agents[agentID];

    //assign color to agent
    colors.push(colorStrToArr(population.data.agentTypes[agent.type].color));

    //prepare agent timeline
    let movementIt = 0, time = 0, movement = agent.movements[movementIt], node;
    for (let i = 0; i < sortedTimestamps.length; i++) {
        time = sortedTimestamps[i];
        if (movement.ti > time && movement.tf > time) {
            //before movement start, stay in place   
            node = network.data.nodes[movement.oid];
            agentTimeline.push(node.x, node.y, 0);
        } else if (movement.ti === time) {
            //assign the initial position of the movement to timeline
            node = network.data.nodes[movement.oid];
            agentTimeline.push(node.x, node.y, 0);
        } else if (movement.ti < time && movement.tf > time) {
            //movement in progress, interpolate the position
            const t = (time - movement.ti) / (movement.tf - movement.ti);
            const x = (1 - t) * network.data.nodes[movement.oid].x + t * network.data.nodes[movement.did].x;
            const y = (1 - t) * network.data.nodes[movement.oid].y + t * network.data.nodes[movement.did].y;
            agentTimeline.push(x, y, 0);
        } else if (movement.tf === time) {
            //assign the final position of the movement to timeline
            node = network.data.nodes[movement.did];
            agentTimeline.push(node.x, node.y, 0);
            movementIt++;
            if (movementIt < agent.movements.length) {
                movement = agent.movements[movementIt];
            } else {
                //fill with static position till the end, no more movements
                node = network.data.nodes[movement.did];
                for (let j = ++i; j < sortedTimestamps.length; j++) {
                    agentTimeline.push(node.x, node.y, 0);
                }
            }
        }
    }
    return agentTimeline;
}

function extractTimestamps(population: PopulationData) {
    const timestamps = new Set<number>();
    for (let agentID in population.data.agents) {
        const agent = population.data.agents[agentID];
        for (let i = 0; i < agent.movements.length; i++) {
            const movement = agent.movements[i];
            timestamps.add(movement.ti);
            timestamps.add(movement.tf);
        }
    }
    return timestamps;
}
