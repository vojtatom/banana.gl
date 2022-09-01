import { groupModelsByType } from './group';
import { assignMetadataIds } from './metadata';
import * as THREE from 'three';
import { mergeGeometries } from './geometries';
import { applyStyle } from './style';
import { MessageType } from '../pool';
import { PointData } from '../../layer/geometry/points';
import { MeshData } from '../../layer/geometry/mesh';

export interface InputData {
    file: string;
    idOffset: number;
    styles: string[];
    baseColor: number;
}

export interface ParsedData {
    metadata: {
        id: number;
        [id: number]: any;
    };
    mesh: MeshData | undefined;
    points: PointData | undefined;
}

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
};

function loadModel(message: MessageEvent<MessageType<InputData>>) {
    const { jobID, data } = message.data;
    const { file, idOffset, styles, baseColor } = data;
    loadGLTF(file, (gltf) => {
        const group = gltf.scene;
        const models = groupModelsByType(group);
        const metadata = assignMetadataIds(models, idOffset);
        const buffers = mergeGeometries(models);

        if (styles.length > 0 && buffers.meshes) {
            const color = applyStyle(styles, baseColor, buffers.meshes, metadata);
            buffers.meshes.setAttribute('color', new THREE.BufferAttribute(color, 3));
        }

        postMessage({
            jobID: jobID,
            result: {
                metadata: metadata,
                mesh: toResultForm(buffers.meshes),
                points: toResultForm(buffers.points),
            }
        });

        (gltf as any) = null;
    });
}


function toResultForm(geometry?: THREE.BufferGeometry) {
    if (!geometry)
        return;

    return {
        positions: geometry.attributes.position.array,
        ids: geometry.attributes.ids.array,
        normals: geometry.attributes.normal ? geometry.attributes.normal.array : undefined,
        colors: geometry.attributes.color ? geometry.attributes.color.array : undefined,
    };
}

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
loader.setDRACOLoader(dracoLoader);


function loadGLTF(file: string, callback: (gltf: GLTF) => void) {
    loader.load(file, callback);
}




