import * as THREE from 'three';
import { agentMaterial } from './agentMaterial';
import { lineMaterial, lineMaterialPick } from './lineMaterial';


export interface MaterialLibraryProps {
    baseColor?: number;
    meshOpacity?: number;
    placeholderColor?: number;
    placeholderOpacity?: number;
    loadingColor?: number;
}

export class MaterialLibrary {
    readonly mesh: THREE.MeshLambertMaterial;
    readonly placeholder: THREE.MeshLambertMaterial;
    readonly line: THREE.ShaderMaterial;
    readonly linePick: THREE.ShaderMaterial;
    readonly point: THREE.PointsMaterial;
    readonly loading: THREE.MeshBasicMaterial;
    readonly agents: THREE.ShaderMaterial;
    readonly baseColor: number;

    constructor(props: MaterialLibraryProps, useVertexColors?: boolean) {

        this.baseColor = props.baseColor ?? 0xffffff;

        this.mesh = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: useVertexColors ? undefined : this.baseColor,
            vertexColors: useVertexColors ?? false,
            opacity: props.meshOpacity ?? 1,
            transparent: true,
        });

        this.placeholder = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: props.placeholderColor ?? 0xaaaaaa,
            opacity: props.placeholderOpacity ?? 0.01,
            transparent: true,
        });

        this.line = lineMaterial();
        this.linePick = lineMaterialPick();
        this.agents = agentMaterial();

        this.point = new THREE.PointsMaterial({
            size: 100,
            color: this.baseColor,
            sizeAttenuation: true,
        });

        this.loading = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: props.loadingColor ?? 0x88ff88,
        });
    }

    updateTime(time: number) {
        this.agents.uniforms.time.value = time;
    }

    updateSegmentTime(timeStart: number, timeEnd: number) {
        this.agents.uniforms.timeStart.value = timeStart;
        this.agents.uniforms.timeEnd.value = timeEnd;
    }
}
