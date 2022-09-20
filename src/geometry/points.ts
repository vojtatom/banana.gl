import * as THREE from 'three';
import { MaterialLibrary } from '../materials/materials';
import { PointData } from './dataInterface';


export class PointModel extends THREE.Points {
    constructor(points: PointData, materials: MaterialLibrary) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(points.positions, 3));
        super(geometry, materials.point);
        this.translateZ(1);
        this.matrixAutoUpdate = false;
    }
}




