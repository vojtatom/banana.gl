import axios from "axios";
import { colorStrToArr } from "../../style/color";
import { LandUseData } from "./dataInterface";


function rotate(x: number, y: number, angle: number) {
    let cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * (x)) + (sin * (y)),
        ny = (cos * (y)) - (sin * (x));
    return [nx, ny];
}

function cwRotatedSquare(diameter: number, angle: number) {
    let half = diameter / 2;
    let x = half, y = half;
    return [...rotate(x, y, angle), ...rotate(-x, y, angle), ...rotate(-x, -y, angle), 
        ...rotate(x, y, angle), ...rotate(-x, -y, angle), ...rotate(x, -y, angle)];
}


export async function loadLandUse(api: string) {
    const data = await axios.get(api);
    const landuse = data.data as LandUseData;
    //setup tiles
    const positions = [];
    const normals = [];
    const colors = [];
    for (let areaID in landuse.data) {
        const area = landuse.data[areaID];
        const color = colorStrToArr(area.color);
        for (let i = 0; i < area.tiles.length; i++) {
            let tile = area.tiles[i];
            let rect = cwRotatedSquare(tile.width, tile.rotation);
            for (let j = 0; j < rect.length; j += 2) {
                positions.push(rect[j] + tile.x, rect[j + 1] + tile.y, 0);
                normals.push(0, 0, 1);
                colors.push(color[0], color[1], color[2]);
            }
        }
    }

    //setup line boundaries
    const linePositions = [];
    const lineColors = [];

    for (let areaID in landuse.data) {
        const area = landuse.data[areaID];
        const color = colorStrToArr(area.color);
        for (let i = 0; i < area.boundary.length; i++) {
            const next = (i + 1) % area.boundary.length;
            linePositions.push(area.boundary[i].x, area.boundary[i].y, 0);
            linePositions.push(area.boundary[next].x, area.boundary[next].y, 0);
            lineColors.push(color[0], color[1], color[2]);
        }
    }

    return {
        tiles: {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            colors: new Float32Array(colors),
        },
        boundaries: {
            segmentEndpoints: new Float32Array(linePositions),
            colors: new Float32Array(lineColors),
            thickness: 5,
            zoffset: 1,
        }
    };

}