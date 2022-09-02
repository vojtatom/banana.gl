import * as THREE from 'three';
import { CullableInstancedMesh } from './cullable';
import { MaterialLibrary } from '../layer/materials';
import { PointData } from './data';

export class InstancedPointModel extends THREE.Group {
    private bsphere: THREE.Sphere = new THREE.Sphere();
    private matrixBuffer = new THREE.Matrix4();

    constructor(points: PointData, materials: MaterialLibrary, pointInstance: THREE.Mesh[]) {
        super();
        this.computeBoundingSphere(points);
        for(let i = 0; i < pointInstance.length; i++)
            this.initInstance(pointInstance[i], points, materials);
        this.matrixAutoUpdate = false;
    }

    private initInstance(mesh: THREE.Mesh, points: PointData, materials: MaterialLibrary) {
        const geometry = mesh.geometry.clone();
        const count = points.positions.length / 3;
        const instancedMesh = new CullableInstancedMesh(geometry, mesh.material, count, this.bsphere);
        for (let i = 0; i < points.positions.length; i += 3) {
            this.matrixBuffer.identity();
            this.matrixBuffer.setPosition(points.positions[i], points.positions[i + 1], points.positions[i + 2]);
            instancedMesh.setMatrixAt(i / 3, this.matrixBuffer);
        }
        this.add(instancedMesh);
    }

    private computeBoundingSphere(points: PointData) {
        const buffer = new THREE.BufferGeometry();
        buffer.setAttribute('position', new THREE.BufferAttribute(points.positions, 3));
        buffer.computeBoundingSphere();
        this.bsphere = buffer.boundingSphere?.clone() ?? new THREE.Sphere();
    }
}