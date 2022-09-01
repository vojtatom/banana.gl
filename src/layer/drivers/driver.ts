import { Layer } from "../layer";
import * as THREE from "three";

export interface DriverProps {
    api: string;
}


export abstract class Driver<DriverProps> {
    constructor(props: DriverProps, layer: Layer) {}
    abstract init(): Promise<void>;
    abstract loadTiles(target: THREE.Vector3, position: THREE.Vector3): Promise<void>;
    abstract get center(): THREE.Vector3;
}