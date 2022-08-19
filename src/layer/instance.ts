import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
loader.setDRACOLoader( dracoLoader );


function recursiveExtractMeshes(object: THREE.Object3D, meshes: THREE.Mesh[]) {
    if (object instanceof THREE.Group || object instanceof THREE.Mesh) {
        object.children.forEach((child) => {
            recursiveExtractMeshes(child, meshes);
        });
    }
    
    if (object instanceof THREE.Mesh) {
        object.children = [];
        meshes.push(object);
    }
}

function loadGLTF(model: string, callback: (model: THREE.Mesh[]) => void) {
    loader.load(model, (gltf) => {
        const meshes: THREE.Mesh[] = [];
        recursiveExtractMeshes(gltf.scene, meshes);
        callback(meshes);
    }, undefined, (error) => {
        console.error(error);
    });
}

export function PointInstanceModel(path: string) {
    let meshes: THREE.Mesh[] = [];
    loadGLTF(path, (meshes) => {
        meshes.forEach((mesh) => {
            meshes.push(mesh);
        });
    });
    return meshes;
}

