import { LineData } from "../../geometry/dataInterface";
import { InstancedLineModel } from "../../geometry/linesInstanced";
import { MeshModel } from "../../geometry/mesh";
import { FluxDriver } from "./driver";

interface ParsedLanduseData {
    tiles: {
        positions: Float32Array,
        normals: Float32Array,
        colors: Float32Array,
    },
    boundaries: {
        positions: Float32Array,
        colors: Float32Array,
    }
}

export class FluxLandUse {

    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'landuse',
        }, (data) => this.setupModels(data as ParsedLanduseData));
    }

    private setupModels(data: ParsedLanduseData) {
        const tiles = new MeshModel(data.tiles, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(tiles);

        const lineData : LineData = {
            positions: data.boundaries.positions,
            colors: data.boundaries.colors,
            thickness: this.driver.landuseThickness,
            transparency: this.driver.landuseTransparency,
        }

        const boundaries = new InstancedLineModel(lineData, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(boundaries);
    }
}