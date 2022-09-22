import { LineData } from "./dataInterface";
import * as THREE from "three";
import { MaterialLibrary } from "../materials/materials";


function capLeft(resolution: number) {
    let vertices = [];
    const shift = Math.PI / 2;
    const step = Math.PI / resolution;

    for (let i = 0; i < resolution; ++i) {
        vertices.push(0, 0, 0);
        vertices.push(Math.cos(shift + step * i), Math.sin(shift + step * i), 0);
        vertices.push(Math.cos(shift + step * (i + 1)), Math.sin(shift + step * (i + 1)), 0);

    }

    return vertices
}

function capRight(resolution: number) {
    let vertices = [];
    const shift = Math.PI / 2;
    const step = Math.PI / resolution;

    for (let i = 0; i < resolution; ++i) {
        vertices.push(1, 0, 0);
        vertices.push(1 - Math.cos(shift + step * i), Math.sin(shift + step * i), 0);
        vertices.push(1 - Math.cos(shift + step * (i + 1)), Math.sin(shift + step * (i + 1)), 0);
    }

    return vertices;
}

function segment(resolution: number = 5) {
    let geometry = [
        0, -1, 0,
        1, -1, 0,
        1, 1, 0,
        0, -1, 0,
        1, 1, 0,
        0, 1, 0
    ];

    geometry = geometry.concat(capLeft(resolution));
    geometry = geometry.concat(capRight(resolution));
    return geometry;
}

const SEGMENT_INSTANCE = new Float32Array(segment());


export class InstancedLineModel extends THREE.InstancedMesh {
    ids: Float32Array;

    constructor(data: LineData, materials: MaterialLibrary) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(SEGMENT_INSTANCE, 3));
        geometry.setAttribute('lineStart', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(data.segmentEndpoints, 6, 1), 3, 0));

        geometry.setAttribute('lineEnd', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(data.segmentEndpoints, 6, 1), 3, 3));

        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(data.colors, 3, true, 1));

        super(geometry, materials.line, data.segmentEndpoints.length / 6);
        
        this.ids = new Float32Array(data.ids);
        this.matrixAutoUpdate = false;
        this.frustumCulled = false; //this one was a big pain to figure out...

        this.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            (material as THREE.ShaderMaterial).uniforms.zoffset.value = data.zoffset;
            (material as THREE.ShaderMaterial).uniforms.thickness.value = data.thickness;
            (material as THREE.ShaderMaterial).uniformsNeedUpdate = true;
        }
    }
}
