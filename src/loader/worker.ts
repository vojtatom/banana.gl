import { groupModelsByType } from './group';
import { assignMetadataIds } from './metadata';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import { mergeGeometries } from './geometries';
import { applyStyle } from './style';


function toResultForm(geometry?: THREE.BufferGeometry) {
    if (!geometry)
        return undefined;

    const result: any = {
        positions: geometry.attributes.position.array,
        ids: geometry.attributes.ids.array,
    };

    if (geometry.attributes.normal) {
        result.normals = geometry.attributes.normal.array;
    }

    if (geometry.attributes.color) {
        result.colors = geometry.attributes.color.array;
    }

    return result;
}

export interface ParsedMesh {
    positions: Float32Array;
    normals: Float32Array;
    ids: Float32Array;
    colors: Float32Array;
} 

export interface ParsedPoints {
    positions: Float32Array;
    ids: Float32Array;
}

export interface ParsedData {
    metadata: {
        id: number;
        [id: number]: any;
    };
    mesh: ParsedMesh | undefined;
    points: ParsedPoints | undefined;
}

interface Buffers {
    meshes: THREE.BufferGeometry | undefined;
    points: THREE.BufferGeometry | undefined;
}


function parse(group: THREE.Group, idOffset: number, styles: string[]): ParsedData {
    const models = groupModelsByType(group);
    const metadata = assignMetadataIds(models, idOffset);
    const buffers = mergeGeometries(models);
    
    if (styles.length > 0) {
        const color = applyStyle(styles, 0xffffff, buffers.meshes, metadata);
        if (color)
            buffers.meshes?.setAttribute('color', new THREE.BufferAttribute(color, 3));
    }
    
    
    return {
        metadata,
        mesh: toResultForm(buffers.meshes),
        points: toResultForm(buffers.points),
    };
}


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
loader.setDRACOLoader( dracoLoader );

function loadModel(message: MessageEvent) {

    const { jobID, data } = message.data;
    const { file, idOffset, styles } = data;
    
    const response: any = {
        jobID: jobID
    };

    loader.load(file, (gltf) => {
        response.result = parse(gltf.scene, idOffset, styles);
        postMessage(response);
        (gltf as any) = null;
    }, undefined, (error) => {
        console.error(error);
    });
}

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
};



