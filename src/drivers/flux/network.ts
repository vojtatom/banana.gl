import { FluxDriver } from "./driver";
import { InstancedLineModel } from "../../geometry/linesInstanced";
import { LineData } from "../../geometry/dataInterface";
import { circleTriangulated } from "../../geometry/circle";
import THREE from "three";
import { nodeInstance } from "../../geometry/node";
import { InstancedPointModel } from "../../geometry/pointsInstanced";


export class FluxNetwork {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'network',
        }, (data) => this.setupModels(data));
    }

    private setupModels(data: any) {
        const lineData: LineData = {
            segmentEndpoints: data.edges.positions,
            colors: data.edges.colors,
            ids: new Float32Array(data.length / 3),
            zoffset: 1,
            thickness: 10,
        };
        
        let model = new InstancedLineModel(lineData, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(model);

        //init circle instance for crossroads
        const nodeModel = [ nodeInstance() ];
        const pointData = {
            positions: data.nodes.positions,
        };
        const crossings = new InstancedPointModel(pointData, this.driver.layer.materials, nodeModel);
        this.driver.layer.ctx.scene.add(crossings);
    }
}