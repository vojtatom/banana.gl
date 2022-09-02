import * as THREE from 'three';
import { MaterialLibrary } from '../materials';



export class PlaceholderMeshModel extends THREE.Mesh {
    constructor(x: number, y: number, dx: number, dy: number, materials: MaterialLibrary) {
        const s = Math.min(dx, dy) / 10; /// 2;
        const geometry = new THREE.CircleGeometry(s, 20);
        const material = materials.placeholder;
        super(geometry, material);
        this.position.set(x, y, 0);
    }
} 


