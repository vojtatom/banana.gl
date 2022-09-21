import { FluxDriver } from "./driver";



export class FluxPopulation {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'population',
        }, (data) => this.setupModels(data));
    }

    private setupModels(data: any) {
        console.log(data);
    }
}