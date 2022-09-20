import axios from "axios";
import { colorStrToArr } from "../../style/color";
import { NetworkData } from "./dataInterface";


export async function loadNetwork(api: string) {
    const data = await axios.get(api);
    const network = data.data as NetworkData;

    //construct the geometry with ids and colors
    const segmentCount = Object.keys(network.data.edges).length
    const positions = new Float32Array(segmentCount * 3 * 2);
    const colors = new Float32Array(segmentCount * 3);

    //prepare color map
    const edgeTypes = network.data.edgeTypes;
    const colorTypeMap: { [key: string]: number[] } = {};
    for(const edgeType in edgeTypes) {
        const color = edgeTypes[edgeType].color;
        colorTypeMap[edgeType] = colorStrToArr(color);
    }

    //fill buffers
    let i = 0, j = 0, k = 0;
    for (const edge_id in network.data.edges) {
        const edge = network.data.edges[edge_id];
        const origin = network.data.nodes[edge.oid];
        const destination = network.data.nodes[edge.did];
        const color = colorTypeMap[edge.type];
        colors[j++] = color[0];
        colors[j++] = color[1];
        colors[j++] = color[2];
        positions[i++] = origin.x;
        positions[i++] = origin.y;
        positions[i++] = 0;
        positions[i++] = destination.x;
        positions[i++] = destination.y;
        positions[i++] = 0;
    }

    //pass it back to the main thread
    return {
        positions,
        colors,
    };
}