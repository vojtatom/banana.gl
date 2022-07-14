import * as THREE from 'three';
import { MeshPhysicalMaterial, LineBasicMaterial } from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';

export type MaterialLibraryProps = {
    baseColor?: number;
    lineColor?: number;
}

export class MaterialLibrary {
    readonly default: MeshPhysicalMaterial;
    readonly line: LineMaterial;

    constructor(resolution: THREE.Vector2, props?: MaterialLibraryProps) {
        if (!props)
            props = {};

        this.default = new MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            color: props.baseColor ?? 0xffffff,
        });

        this.default.needsUpdate = true;

        this.line = new LineMaterial({
            color: props.lineColor ?? 0xFFFFFF,
            linewidth: 5,
            resolution: resolution, //WHAT?
        });
    }
}
