import * as THREE from 'three';
import { Graphics } from '../graphics';
import { LayoutType, TileType } from '../types';
import { MaterialLibrary } from '../material';


export function pulsingPlaceholder(position:THREE.Vector3, size: THREE.Vector3, matlib: MaterialLibrary) {
    const s = Math.min(size.x, size.y) / 2;
    const geometry = new THREE.BoxGeometry(s, s, s / 20);
    const material = matlib.loading;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position.addScaledVector(size, 0.5));
    
    let tick = 0;
    mesh.onBeforeRender = () => {
        const scl = Math.sin(tick++ / 20) * 0.3 + 0.7;
        mesh.scale.set(scl, scl, scl);
    };

    return mesh;
}

export class LoadingAnimation {
    loadingMesh: THREE.Mesh;
    graphics: Graphics;

    constructor(tile: TileType, layout: LayoutType, graphics: Graphics) {
        this.graphics = graphics;
        const position = new THREE.Vector3(tile.x * layout.tileWidth, tile.y * layout.tileHeight, 0);
        const size = new THREE.Vector3(layout.tileWidth, layout.tileHeight, 0);
        const mesh = pulsingPlaceholder(position, size, graphics.materialLibrary);
        this.graphics.scene.add(mesh);
        this.loadingMesh = mesh;
    }

    finished() {
        this.graphics.scene.remove(this.loadingMesh);
    }
}