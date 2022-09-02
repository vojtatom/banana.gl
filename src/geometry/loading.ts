import * as THREE from 'three';
import { MaterialLibrary } from '../layer/materials';



export class LoadingMeshModel extends THREE.Mesh {
    constructor(x: number, y: number, dx: number, dy: number, materials: MaterialLibrary) {
        const s = Math.min(dx, dy) / 2;
        const geometry = new THREE.BoxGeometry(s, s, s / 20);
        const material = materials.loading;
        
        super(geometry, material);

        this.position.set(x, y, 0);
        let tick = 0;
        this.onBeforeRender = () => {
            const scl = Math.sin(tick++ / 20) * 0.3 + 0.7;
            this.scale.set(scl, scl, scl);
        };
    }
} 


