import * as THREE from 'three';
import { MeshPhysicalMaterial, LineBasicMaterial } from 'three';


export type MaterialLibraryProps = {
    baseColor?: number;
    lineColor?: number;
}

export class MaterialLibrary {
    readonly default: MeshPhysicalMaterial;
    readonly line: LineBasicMaterial;

    constructor(props?: MaterialLibraryProps) {
        if (!props)
            props = {};

        this.default = new MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            color: props.baseColor ?? 0xffffff,
        });

        this.default.needsUpdate = true;

        this.line = new LineBasicMaterial({
            color: props.lineColor ?? 0xFFFFFF,
            linewidth: 1,
            transparent: true,
            opacity: 1.0,
        });
    }
}
