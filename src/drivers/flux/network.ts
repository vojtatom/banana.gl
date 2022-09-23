import { FluxDriver } from "./driver";
import { InstancedLineModel } from "../../geometry/linesInstanced";
import { LineData, PointData } from "../../geometry/dataInterface";
import { nodeInstance } from "../../geometry/node";
import { InstancedPointModel } from "../../geometry/pointsInstanced";


interface ParsedNetworkData {
    edges: {
        positions: Float32Array,
        colors: Float32Array,
        ids: Float32Array,
        metadata: {[id: number]: any},
    },
    nodes: {
        positions: Float32Array,
    }
}


export class FluxNetwork {
    constructor (private driver: FluxDriver) {
        this.driver.layer.ctx.workers.flux.load({
            api: this.driver.api,
            type: 'network',
        }, (data) => this.setupModels(data as ParsedNetworkData));
    }

    private setupModels(data: ParsedNetworkData) {
        const lineData: LineData = {
            positions: data.edges.positions,
            colors: data.edges.colors,
            ids: data.edges.ids,
            thickness: this.driver.networkThickness,
            transparency: this.driver.networkTransparency,
        };

        for (const id in data.edges.metadata) {
            this.driver.layer.metadata[id] = data.edges.metadata[id];
        }

        this.driver.layer.metadata
        
        let model = new InstancedLineModel(lineData, this.driver.layer.materials);
        this.driver.layer.ctx.scene.add(model);
        let pickingModel = new InstancedLineModel(lineData, this.driver.layer.materials);
        pickingModel.material = this.driver.layer.materials.linePick;
        this.driver.layer.ctx.picker.addPickableWithPickingMaterial(pickingModel);

        //init circle instance for crossroads
        const nodeModel = [ nodeInstance(this.driver.networkThickness) ];
        const pointData: PointData = {
            positions: data.nodes.positions,
        };
        const crossings = new InstancedPointModel(pointData, this.driver.layer.materials, nodeModel);
        this.driver.layer.ctx.scene.add(crossings);
    }
}