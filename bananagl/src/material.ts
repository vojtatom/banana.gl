import * as THREE from 'three';
import { MeshToonMaterial } from 'three';


export class MaterialLibrary {
    default: MeshToonMaterial;

    constructor() {
        const gradient = new THREE.DataTexture(
            Uint8Array.from([0, 0, 0, 255, 128, 128, 128, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat
        );
        
        gradient.minFilter = THREE.NearestFilter;
        gradient.magFilter = THREE.NearestFilter;
        gradient.needsUpdate = true;

        this.default = new MeshToonMaterial({
            side: THREE.DoubleSide,
            color: 0xFFFFFF,
            //vertexColors: true,
            gradientMap: gradient,
        });

        this.default.needsUpdate = true;
    }
}
