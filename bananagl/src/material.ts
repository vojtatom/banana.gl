import * as THREE from 'three';
import { MeshToonMaterial } from 'three';


export class MaterialLibrary {
    default: MeshToonMaterial;

    constructor() {
        const threeTone = new THREE.DataTexture(
            Uint8Array.from([0, 0, 0, 255, 128, 128, 128, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat
        );
        
        threeTone.minFilter = THREE.NearestFilter;
        threeTone.magFilter = THREE.NearestFilter;
        threeTone.needsUpdate = true;

        this.default = new MeshToonMaterial({
            side: THREE.DoubleSide,
            color: 0x049ef4,
            gradientMap: threeTone,
        });

        this.default.needsUpdate = true;
    }
}
