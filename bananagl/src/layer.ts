import { LayerLoader } from "./loader";
import { Box3, Vector3, Mesh, BufferGeometry, BufferAttribute } from "three";
import { Graphics } from "./graphics";

export type LayerType = {
    path: string;
    name?: string;
}


type ParsedGeometry = {
    positions: Float32Array;
    normals: Float32Array;
    colors: Float32Array;
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

    locate(x: number, y: number) {
        this.loader.locate(x, y);
    }

    onDataLoaded(parsed_geometry: ParsedGeometry) {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(parsed_geometry.positions, 3));
        geometry.setAttribute('normal', new BufferAttribute(parsed_geometry.normals, 3));
        geometry.setAttribute('color', new BufferAttribute(parsed_geometry.colors, 3));
        const m = new Mesh(geometry, this.graphics.materialLibrary.default);
        this.graphics.scene.add(m);

        const aabb = new Box3();
        aabb.setFromObject(m);
        const center = aabb.getCenter(new Vector3());
        this.graphics.focus(center.x, center.y, center.z);
    }
}