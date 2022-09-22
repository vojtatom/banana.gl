import { InstancedAgentModel } from "../../geometry/agents";
import { AgentData } from "../../geometry/dataInterface";
import { FluxDriver } from "./driver";


export class FluxPopulation {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'population',
        }, (data) => this.setupModels(data as AgentData));
    }

    private setupModels(data: AgentData) {
        const model = new InstancedAgentModel(data, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(model);
        this.driver.layer.ctx.timeMax = data.timestamps[data.timestamps.length - 1];
    }
}