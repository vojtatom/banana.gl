import * as THREE from 'three';
import { MeshPhysicalMaterial } from 'three';
import { LineMaterial } from 'three-fatline';
export declare type MaterialLibraryProps = {
    baseColor?: number;
    lineColor?: number;
};
export declare class MaterialLibrary {
    readonly default: MeshPhysicalMaterial;
    readonly line: LineMaterial;
    constructor(resolution: THREE.Vector2, props?: MaterialLibraryProps);
}
