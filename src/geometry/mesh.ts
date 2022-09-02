import * as THREE from 'three';
import { MaterialLibrary } from '../layer/materials';
import { MeshData } from './dataInterface';


export class MeshModel extends THREE.Mesh {
    constructor(data: MeshData, materials: MaterialLibrary) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(data.normals, 3));
        geometry.setAttribute('idcolor', new THREE.BufferAttribute(data.ids, 3));

        if (data.colors){
            geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
        }

        super(geometry, materials.mesh);
        this.matrixAutoUpdate = false;
    }
}
