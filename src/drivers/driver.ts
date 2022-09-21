import { Layer } from "../layer/layer";
import * as THREE from "three";

export interface DriverProps {
    api: string | string[];
}


export abstract class Driver<Props extends DriverProps> {
    constructor(props: DriverProps, layer: Layer) {}
    //make this assync when you implement it
    abstract init(): Promise<void>;
    //make this assync when you implement it
    abstract updateView(target: THREE.Vector3, position: THREE.Vector3): Promise<void>;
    //always called after init 
    abstract get center(): THREE.Vector3;
}