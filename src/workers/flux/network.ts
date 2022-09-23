import axios from "axios";
import { colorStrToArr } from "../../style/color";
import { NetworkData } from "./dataInterface";


export async function loadNetwork(api: string) {
    const data = await axios.get(api);
    const network = data.data as NetworkData;
    
    const colorTypeMap: { [key: string]: number[]; } = colorMap(network);
    const { edgePositions, edgeColors } = networkLineGeometry(network, colorTypeMap);
    const nodePositions = networkNodeGeometry(network);

    return {
        edges: {
            positions: new Float32Array(edgePositions),
            colors: new Float32Array(edgeColors),
        },
        nodes: {
            positions: new Float32Array(nodePositions),
        }
    };
}

function networkNodeGeometry(network: NetworkData) {
    const nodePositions = [];
    for (const nodeID in network.data.nodes) {
        const node = network.data.nodes[nodeID];
        nodePositions.push(node.x, node.y, 0);
    }
    return nodePositions;
}

function networkLineGeometry(network: NetworkData, colorTypeMap: { [key: string]: number[]; }) {
    const edgePositions = [];
    const edgeColors = [];
    //const zOffsets = 0.01;
    let zLevel = 1;
    for (const edgeID in network.data.edges) {
        const edge = network.data.edges[edgeID];
        const origin = network.data.nodes[edge.oid];
        const destination = network.data.nodes[edge.did];
        const color = colorTypeMap[edge.type];
        edgePositions.push(origin.x, origin.y, zLevel, destination.x, destination.y, zLevel);
        edgeColors.push(color[0], color[1], color[2]);
        //zLevel += zOffsets;
    }
    return { edgePositions, edgeColors };
}

function colorMap(network: NetworkData) {
    const edgeTypes = network.data.edgeTypes;
    const colorTypeMap: { [key: string]: number[]; } = {};
    for (const edgeType in edgeTypes) {
        const color = edgeTypes[edgeType].color;
        colorTypeMap[edgeType] = colorStrToArr(color);
    }
    return colorTypeMap;
}