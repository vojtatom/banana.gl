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
    for (const edgeID in network.data.edges) {
        const edge = network.data.edges[edgeID];
        const origin = network.data.nodes[edge.oid];
        const destination = network.data.nodes[edge.did];
        const color = colorTypeMap[edge.type];
        positions.push(origin.x, origin.y, 0, destination.x, destination.y, 0);
        colors.push(color[0], color[1], color[2]);
    }

    //pass it back to the main thread
    return {
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
    };
}