import * as THREE from 'three';

export class CullableInstancedMesh extends THREE.InstancedMesh {
    boundingSphere?: THREE.Sphere | null;
    cullable?: boolean;
    
    constructor(geometry: THREE.BufferGeometry, material: THREE.Material|THREE.Material[], bsphere: THREE.Sphere, count: number) {
        super(geometry, material, count);
        this.count = count;
        this.geometry.boundingSphere = bsphere;
        this.frustumCulled = true;
    }

    computeBoundingSphere() {
        console.error('Bounding sphere initialized by constructor');
    }
}