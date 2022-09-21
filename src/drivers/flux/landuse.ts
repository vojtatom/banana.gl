import { InstancedLineModel } from "../../geometry/linesInstanced";
import { MeshModel } from "../../geometry/mesh";
import { FluxDriver } from "./driver";



export class FluxLandUse {

    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'landuse',
        }, (data) => this.setupModels(data));
    }

    private setupModels(data: any) {
        const tiles = new MeshModel(data.tiles, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(tiles);
        const boundaries = new InstancedLineModel(data.boundaries, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(boundaries);
    }
}