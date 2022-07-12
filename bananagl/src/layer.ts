import { LayerLoader } from "./layerLoader";
import { Group, Box3, Vector3, Mesh, BufferGeometry } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
        const aabb = new Box3();
        aabb.setFromObject( group );
        const center = aabb.getCenter(new Vector3());
        const geometries: BufferGeometry[] = []

        group.children.forEach((child) => {
            if (child instanceof Group) {
                this.onDataLoaded(child);
            } else if (child instanceof Mesh) {
                child.material = this.graphics.materialLibrary.default;
                geometries.push(child.geometry);
                child.remove();
            } else {
                console.error(`Unknown child type ${child.type}`);
            }
        });

        const singleGeometry = mergeBufferGeometries(geometries);
        const m = new Mesh(singleGeometry, this.graphics.materialLibrary.default);
        singleGeometry.computeVertexNormals();
        this.graphics.scene.add(m);
        this.graphics.focus(center.x, center.y, center.z);
    }
}