import axios from "axios";
import { PopulationData, NetworkData } from "./dataInterface";


export async function loadPopulation(api: string[]) {
    const [ populationAPI, networkAPI ] = api;
    const pdata = await axios.get(populationAPI);
    const ndata = await axios.get(networkAPI);
    const population = pdata.data as PopulationData;
    const network = ndata.data as NetworkData;

    //sort movement events and prepare vitual timeline
    const timestamps = new Set<number>();
    for (let agentID in population.data.agents) {
        const agent = population.data.agents[agentID];
        for (let i = 0; i < agent.movements.length; i++) {
            const movement = agent.movements[i];
            timestamps.add(movement.ti);
            timestamps.add(movement.tf);
        }
    }

    //sort timestamps
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);
    const timeline = [];
    for (let agentID in population.data.agents) {
        const agentTimeline = [];
        const agent = population.data.agents[agentID];
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
                if (movementIt < agent.movements.length){
                    movement = agent.movements[movementIt];
                } else {
                    //fill with static position till the end, no more movements
                    node = network.data.nodes[movement.did];
                    for (let j = i; j < sortedTimestamps.length; j++) {
                        agentTimeline.push(node.x, node.y, 0);
                    }
                }
            } 
        }
        timeline.push(agentTimeline);
    }

    //invert 2D buffer
    const positions = [];
    for (let i = 0; i < timeline[0].length; i += 3) {
        const row = [];
        for (let j = 0; j < timeline.length; j++) {
            row.push(timeline[j][i], timeline[j][i + 1], timeline[j][i + 2]);
        }
        positions.push(row);
    }

    //to Float32Array
    const positionsArray = [];
    for (let i = 0; i < positions.length; i++) {
        positionsArray.push(new Float32Array(positions[i]));
    }


    return {
        positions: positionsArray,
        timestamps: new Float32Array(sortedTimestamps)
    }
}