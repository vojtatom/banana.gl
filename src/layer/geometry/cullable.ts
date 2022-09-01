import * as THREE from 'three';

export class CullableInstancedMesh extends THREE.InstancedMesh {    
    constructor(geometry: THREE.BufferGeometry, material: THREE.Material|THREE.Material[], count: number, bsphere: THREE.Sphere) {
        super(geometry, material, count);
        this.geometry.boundingSphere = bsphere;
        this.frustumCulled = true;
    }

    computeBoundingSphere() {
        console.error('Bounding sphere initialized by constructor');
    }
}

