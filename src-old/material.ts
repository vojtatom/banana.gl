import * as THREE from 'three';
import { MeshBasicMaterial, MeshPhysicalMaterial, PointsMaterial } from 'three';
import { LineMaterial } from 'three-fatline';

export type MaterialLibraryProps = {
    baseColor?: number;
    lineColor?: number;
}

export class MaterialLibrary {
    readonly default: MeshPhysicalMaterial;
    readonly line: LineMaterial;
    readonly point: PointsMaterial;
    readonly loading: MeshBasicMaterial;

    constructor(resolution: THREE.Vector2, props?: MaterialLibraryProps) {
        if (!props)
            props = {};

        this.default = new MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            color: props.baseColor ?? 0xffffff,
        });

        this.line = new LineMaterial({
            color: props.lineColor ?? 0xFFFFFF,
            linewidth: 5,
            resolution: resolution, //WHAT?
        });

        this.point = new PointsMaterial({
            size: 10,
            color: props.baseColor ?? 0x000000,
            sizeAttenuation: true,
        });

        this.loading = new MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0xddffdd,
        });
    }
}
