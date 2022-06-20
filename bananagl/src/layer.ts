import { LayerLoader } from "./layerLoader";

export type LayerType = {
    path: string;
    name?: string;
}


export class Layer {
    name: string;
    loader: LayerLoader;
    objects: any[] = [];

    constructor(props: LayerType) {
        this.name = props.name? props.name : props.path;
        this.loader = new LayerLoader(this, props.path);
    }
}