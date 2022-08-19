import * as THREE from 'three';
import { MeshBasicMaterial, MeshPhysicalMaterial, PointsMaterial } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';


export interface MaterialLibraryProps {
    baseColor?: number;
    lineColor?: number;
}

export interface MaterialLibrary {
    base: MeshPhysicalMaterial;
    line: LineMaterial;
    point: PointsMaterial;
    loading: MeshBasicMaterial;
}

export function MaterialLibrary(props?: MaterialLibraryProps): MaterialLibrary {
    if (!props)
        props = {};

    const base = new MeshPhysicalMaterial({
        side: THREE.DoubleSide,
        color: props.baseColor ?? 0xffffff,
    });

    const line = new LineMaterial({
        color: props.lineColor ?? 0xFFFFFF,
        linewidth: 5
    });

    const point = new PointsMaterial({
        size: 10,
        color: props.baseColor ?? 0x000000,
        sizeAttenuation: true,
    });

    const loading = new MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: 0xddffdd,
    });

    return {
        base,
        line,
        point,
        loading,
    };
}
