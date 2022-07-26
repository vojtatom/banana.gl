import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Layer } from '../layer';
import { ParsedGeometry } from '../types';


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
    }
    , undefined, (error) => {
        console.error(error);
    });
}

class CullableInstancedMesh extends THREE.InstancedMesh {
    boundingSphere?: THREE.Sphere | null;
    cullable?: boolean;
    
    constructor(geometry: THREE.BufferGeometry, material: THREE.Material|THREE.Material[], bsphere: THREE.Sphere, count: number) {
        super(geometry, material, count);
        this.count = count;
        this.geometry.boundingSphere = bsphere;
        this.frustumCulled = true;
        console.log(this.boundingSphere);
    }

    computeBoundingSphere() {
        console.error('Bounding sphere initialized by constructor');
    }
}


export class PointInstance {
    meshes: THREE.Mesh[] = [];

    constructor(model: string) {
        loadGLTF(model, (meshes) => {
            meshes.forEach((mesh) => {
                this.meshes.push(mesh);
            });
        });
    }
}




export class PointsGeometry {
    layer: Layer;

    constructor(layer: Layer, parsedGeometry: ParsedGeometry, pointInstance?: PointInstance) {
        this.layer = layer;
        if (pointInstance) {
            this.initInstancedPoints(parsedGeometry, pointInstance);
        } else {
            this.initPoints(parsedGeometry);
        }
    }

    get graphics() {
        return this.layer.graphics;
    }

    private initPoints(parsedGeometry: ParsedGeometry) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(parsedGeometry.positions, 3));
        geometry.setAttribute('idcolor', new THREE.BufferAttribute(parsedGeometry.ids, 3));
        const m = new THREE.Points(geometry, this.layer.materialLibrary.point);
        this.graphics.scene.add(m);
        this.graphics.needsRedraw = true;
    }

    private initInstancedPoints(parsedGeometry: ParsedGeometry, pointInstance: PointInstance) {
        const matrix = new THREE.Matrix4();
        const scale = new THREE.Vector3(1, 1, 1);
        const bsphere = this.computeBoundingSphere(parsedGeometry);

        pointInstance.meshes.forEach((mesh) => {
            const geometry = mesh.geometry.clone();            
            const instancedMesh = new CullableInstancedMesh(geometry, mesh.material, bsphere, parsedGeometry.positions.length / 3);
            for (let i = 0; i < parsedGeometry.positions.length; i += 3) {
                this.initInstanceMatrix(matrix, parsedGeometry, i, scale);
                instancedMesh.setMatrixAt(i / 3, matrix);
            }
            this.graphics.scene.add(instancedMesh);
            this.graphics.needsRedraw = true;
        });
    }

    private computeBoundingSphere(parsedGeometry: ParsedGeometry) {
        const buffer = new THREE.BufferGeometry();
        buffer.setAttribute('position', new THREE.BufferAttribute(parsedGeometry.positions, 3));
        buffer.computeBoundingSphere();
        const bsphere = buffer.boundingSphere?.clone() ?? new THREE.Sphere();
        return bsphere;
    }

    private initInstanceMatrix(matrix: THREE.Matrix4, parsedGeometry: ParsedGeometry, i: number, scale: THREE.Vector3) {
        matrix.identity();
        matrix.makeRotationZ(Math.random() * Math.PI);
        matrix.setPosition(parsedGeometry.positions[i], parsedGeometry.positions[i + 1], parsedGeometry.positions[i + 2]);
        const width = 1 + Math.random();
        const height = 1 + Math.random();
        scale.set(width, width, height);
        matrix.scale(scale);
    }
}