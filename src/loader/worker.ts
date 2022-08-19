import { groupModelsByType } from './group';
import { assignMetadataIds } from './metadata';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
import { mergeGeometries } from './geometries';


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

    return result;
}

export interface ParsedMesh {
    positions: ArrayLike<number>;
    normals: ArrayLike<number>;
    ids: ArrayLike<number>;
} 

export interface ParsedPoints {
    positions: ArrayLike<number>;
    ids: ArrayLike<number>;
}

export interface ParsedData {
    metadata: {
        id: number;
        [id: number]: any;
    };
    mesh: ParsedMesh | undefined;
    points: ParsedPoints | undefined;
}

function parse(group: THREE.Group, idOffset: number): ParsedData {
    const models = groupModelsByType(group);
    const metadata = assignMetadataIds(models, idOffset);
    const buffers = mergeGeometries(models);
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
    const { file, idOffset } = data;
    
    const response: any = {
        jobID: jobID
    };

    loader.load(file, (gltf) => {
        response.result = parse(gltf.scene, idOffset);
        postMessage(response);
    }, undefined, (error) => {
        console.error(error);
    });
}

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
};



