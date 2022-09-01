import * as THREE from 'three';
import { MeshBasicMaterial, MeshLambertMaterial, PointsMaterial } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';


export interface MaterialLibraryProps {
    baseColor?: number;
    placeholderColor?: number;
    loadindColor?: number;
}

export class MaterialLibrary {
    readonly mesh: MeshLambertMaterial;
    readonly placeholder: MeshLambertMaterial;
    readonly line: LineMaterial;
    readonly point: PointsMaterial;
    readonly loading: MeshBasicMaterial;
    readonly baseColor: number;

    constructor(props: MaterialLibraryProps, useVertexColors?: boolean) {

        this.baseColor = props.baseColor ?? 0xffffff;

        this.mesh = new MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: useVertexColors ? undefined : this.baseColor,
            vertexColors: useVertexColors ?? false,
        });

        this.placeholder = new MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: props.placeholderColor ?? 0xaaaaaa,
            opacity: 0.01,
            transparent: true,
        });

        this.line = new LineMaterial({
            color: this.baseColor,
            linewidth: 5,
        });

        this.point = new PointsMaterial({
            size: 100,
            color: this.baseColor,
            sizeAttenuation: true,
        });

        this.loading = new MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: props.loadindColor ?? 0x88ff88,
        });
    }
}
