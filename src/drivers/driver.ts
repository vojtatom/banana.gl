import { Layer } from "../layer/layer";
import * as THREE from "three";

export interface DriverProps {
    api: string;
}


export abstract class Driver<Props extends DriverProps> {
    constructor(props: DriverProps, layer: Layer) {}
    abstract init(): Promise<void>;
    abstract updateView(target: THREE.Vector3, position: THREE.Vector3): Promise<void>;
    abstract get center(): THREE.Vector3;
}