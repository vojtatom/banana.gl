import { LayerLoader } from "./layerLoader";
import { Group, Box3, Vector3 } from "three";
import { Graphics } from "./graphics";

export type LayerType = {
    path: string;
    name?: string;
}


export class Layer {
    name: string;
    loader: LayerLoader;
    graphics: Graphics;

    constructor(props: LayerType, graphics: Graphics) {
        this.name = props.name? props.name : props.path;
        this.graphics = graphics;
        this.loader = new LayerLoader(this, props.path);
    }

    onDataLoaded(group: Group) {
        this.graphics.scene.add(group);
        const aabb = new Box3();
        aabb.setFromObject( group );
        const center = aabb.getCenter(new Vector3());
        console.log(`Layer ${this.name} loaded, center: ${center.x} ${center.y} ${center.z}`);
        this.graphics.focus(center.x, center.y, center.z);
    }
}