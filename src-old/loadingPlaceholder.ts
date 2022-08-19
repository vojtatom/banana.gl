import { Mesh, Vector3, BoxGeometry } from 'three';
import { MaterialLibrary } from './material';


export function pulsingPlaceholder(position: Vector3, size: Vector3, matlib: MaterialLibrary) {
    const s = Math.min(size.x, size.y) / 2;
    const geometry = new BoxGeometry(s, s, s / 20);
    const material = matlib.loading;
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(position.addScaledVector(size, 0.5));
    
    let tick = 0;
    mesh.onBeforeRender = () => {
        const scl = Math.sin(tick++ / 20) * 0.3 + 0.7;
        mesh.scale.set(scl, scl, scl);
    };

    return mesh;
}