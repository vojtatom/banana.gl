import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
loader.setDRACOLoader(dracoLoader);


function loadGLTF(model: string) {
    const models = new Promise<GLTF>(resolve => loader.load(model, resolve));
    return models;
}


export class PointInstance {
    models: THREE.Mesh[] = [];
    path: string;
    constructor(path: string) {
        this.path = path;
    }
    
    async load() {
        const gltf = await loadGLTF(this.path);
        this.recursiveExtractMeshes(gltf.scene);
    }

    private recursiveExtractMeshes(object: THREE.Object3D) {
        if (object instanceof THREE.Group || object instanceof THREE.Mesh) {
            for (let i = 0; i < object.children.length; i++)
                this.recursiveExtractMeshes(object.children[i]);
        }
    
        if (object instanceof THREE.Mesh) {
            object.children = [];
            this.models.push(object);
        }
    }
}



