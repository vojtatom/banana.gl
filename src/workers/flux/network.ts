import axios from "axios";
import { colorHex, colorStrToArr } from "../../style/color";
import { NetworkData, PerformanceData } from "./dataInterface";


export async function loadNetwork(api: string) {
    const data = await axios.get(api[0]);
    const network = data.data as NetworkData;
    
    const colorTypeMap: { [key: string]: number[]; } = colorMap(network);
    const { edgePositions, edgeColors, edgeIDs, metadata } = networkLineGeometry(network, colorTypeMap);
    const nodePositions = networkNodeGeometry(network);

    const performanceData = await axios.get(api[1]);
    const performance = performanceData.data as PerformanceData;

    for (const edgeID in metadata) {
        const id = metadata[edgeID].stringID;
        metadata[edgeID].performance = performance.data.counts[id];
    }

    return {
        edges: {
            positions: new Float32Array(edgePositions),
            colors: new Float32Array(edgeColors),
            ids: new Float32Array(edgeIDs),
            metadata: metadata,
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
    const edgeIDs = [];

    let id = 0;
    const metadata: {[id: number]: any} = {};

    let zLevel = 1;
    let zLevelOffset = 0.00001;
    for (const edgeID in network.data.edges) {
        const edge = network.data.edges[edgeID];
        const origin = network.data.nodes[edge.oid];
        const destination = network.data.nodes[edge.did];
        const color = colorTypeMap[edge.type];
        const idcolor = colorHex(id);
        edgePositions.push(origin.x, origin.y, zLevel, destination.x, destination.y, zLevel);
        edgeColors.push(color[0], color[1], color[2]);
        edgeIDs.push(idcolor[0], idcolor[1], idcolor[2]);
        metadata[id] = {
            stringID: edgeID,
            bbox: [[Math.min(origin.x, destination.x), Math.min(origin.y, destination.y), 0], 
                   [Math.max(origin.x, destination.x), Math.max(origin.y, destination.y), 0]],
        };
        id++;
        zLevel -= zLevelOffset;
    }
    return { edgePositions, edgeColors, edgeIDs, metadata};
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