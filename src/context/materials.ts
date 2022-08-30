import * as THREE from 'three';
import { MeshBasicMaterial, MeshLambertMaterial, MeshPhysicalMaterial, PointsMaterial } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';


export interface MaterialLibraryProps {
    baseColor?: number;
    lineColor?: number;
    pointColor?: number;
    loadindColor?: number;
}

export interface MaterialLibrary {
    mesh: MeshLambertMaterial;
    line: LineMaterial;
    point: PointsMaterial;
    loading: MeshBasicMaterial;
    baseColor: number;
}


function propsDefaults(props: MaterialLibraryProps) {
    props.baseColor = props.baseColor ?? 0xffffff;
    props.lineColor = props.lineColor ?? 0x000000;
    props.pointColor = props.pointColor ?? 0x000000;
    props.loadindColor = props.loadindColor ?? 0x88ff88;
}

export function MaterialLibrary(props: MaterialLibraryProps, useVertexColors?: boolean): MaterialLibrary {
    propsDefaults(props);

    const mesh = new MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: useVertexColors ? undefined : props.baseColor,
        vertexColors: useVertexColors ?? false,
    });

    const line = new LineMaterial({
        color: props.lineColor,
        linewidth: 5,
    });

    const point = new PointsMaterial({
        size: 100,
        color: props.pointColor,
        sizeAttenuation: true,
    });

    const loading = new MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: props.loadindColor,
    });

    return {
        mesh,
        line,
        point,
        loading,
        baseColor: props.baseColor!,
    };
}
