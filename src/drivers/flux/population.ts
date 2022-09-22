import { InstancedAgentModel } from "../../geometry/agents";
import { FluxDriver } from "./driver";


export class FluxPopulation {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'population',
        }, (data) => this.setupModels(data));
    }

    private setupModels(data: any) {
        const { positions, timestamps } = data;
        const model = new InstancedAgentModel(positions, timestamps, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(model);
    }
}