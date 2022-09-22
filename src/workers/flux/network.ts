import axios from "axios";
import { colorStrToArr } from "../../style/color";
import { NetworkData } from "./dataInterface";


export async function loadNetwork(api: string) {
    const data = await axios.get(api);
    const network = data.data as NetworkData;

    //construct the geometry with ids and colors
    const positions = [];
    const colors = [];

    //prepare color map
    const edgeTypes = network.data.edgeTypes;
    const colorTypeMap: { [key: string]: number[] } = {};
    for(const edgeType in edgeTypes) {
        const color = edgeTypes[edgeType].color;
        colorTypeMap[edgeType] = colorStrToArr(color);
    }

    //fill buffers
    const zOffsets = 0.01
    let zLevel = 0; 
    for (const edgeID in network.data.edges) {
        const edge = network.data.edges[edgeID];
        const origin = network.data.nodes[edge.oid];
        const destination = network.data.nodes[edge.did];
        const color = colorTypeMap[edge.type];
        positions.push(origin.x, origin.y, zLevel, destination.x, destination.y, zLevel);
        colors.push(color[0], color[1], color[2]);
        zLevel += zOffsets;
    }

    //extract only node positions
    const nodePositions = [];
    for (const nodeID in network.data.nodes) {
        const node = network.data.nodes[nodeID];
        nodePositions.push(node.x, node.y, 0);
    }

    //create instance


    //pass it back to the main thread
    return {
        edges: {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
        },
        nodes: {
            positions: new Float32Array(nodePositions),
        }
    };
}