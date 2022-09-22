import { InstancedAgentModel } from "../../geometry/agents";
import { AgentData } from "../../geometry/dataInterface";
import { FluxDriver } from "./driver";

interface ParsedAgentData {
    positions: Float32Array[];
    timestamps: Float32Array;
    colors: Float32Array;
}

export class FluxPopulation {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'population',
        }, (data) => this.setupModels(data as ParsedAgentData));
    }

    private setupModels(data: ParsedAgentData) {
        const agentData: AgentData = {
            positions: data.positions,
            timestamps: data.timestamps,
            colors: data.colors,
            size: this.driver.networkThickness,
            zoffset: 1 + this.driver.networkThickness * 0.5,
        };

        const model = new InstancedAgentModel(agentData, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(model);
        this.driver.layer.ctx.timeMax = data.timestamps[data.timestamps.length - 1];

        this.driver.layer.ctx.onBeforeFrame = (time) => {
            model.updateVisibility(time);
        }
    }
}