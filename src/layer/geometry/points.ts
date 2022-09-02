import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export interface PointData {
    positions: Float32Array;
    ids: Float32Array;
}


export class PointModel extends THREE.Points {
    constructor(points: PointData, materials: MaterialLibrary) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(points.positions, 3));
        super(geometry, materials.point);
        this.translateZ(1);
    }
}




