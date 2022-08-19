import * as THREE from 'three';
import { MaterialLibrary } from '../context/materials';
import { Layer } from './layer';
import { TileType } from './layout';


function pulsingPlaceholder(position:THREE.Vector3, size: THREE.Vector3, matlib: MaterialLibrary) {
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

export interface LoadingAnimation {
    stop: () => void;
}

export function LoadingAnimation(tile: TileType, layer: Layer) {
    const { tileWidth, tileHeight } = layer.layout.tileDims;

    const position = new THREE.Vector3(tile.x * tileWidth, tile.y * tileHeight, 0);
    const size = new THREE.Vector3(tileWidth, tileHeight, 0);
    const mesh = pulsingPlaceholder(position, size, layer.materials);
    layer.ctx.scene.add(mesh);

    return {
        stop: () => {
            layer.ctx.scene.remove(mesh);
        },
    };
}