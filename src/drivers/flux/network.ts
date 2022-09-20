import { FluxDriver } from "./driver";
import { InstancedLineModel } from "../../geometry/linesInstanced";
import { LineData } from "../../geometry/dataInterface";


export class FluxNetwork {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.networkAPI,
            type: 'network',
        }, (data) => this.setupModels(data));
    }

    private setupModels(data: any) {
        const lineData: LineData = {
            segmentEndpoints: data.positions,
            colors: data.colors,
            ids: new Float32Array(data.length / 3),
            offset: 1,
            width: 0.1,
        }

        console.log(lineData);

        let model = new InstancedLineModel(lineData, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(model);
    }
}