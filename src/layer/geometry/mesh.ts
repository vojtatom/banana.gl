import * as THREE from 'three';
import { ParsedData } from '../../loader/worker';
import { Layer } from '../layer';


export function MeshGeometry(data: ParsedData, layer: Layer) {
    if (!data.mesh)
        return;

    const { mesh } = data;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
    geometry.setAttribute('idcolor', new THREE.BufferAttribute(mesh.ids, 3));

    if (mesh.colors)
        geometry.setAttribute('color', new THREE.BufferAttribute(mesh.colors, 3));
        
    const m = new THREE.Mesh(geometry, layer.materials.mesh);

    if (layer.pickable) {
        layer.ctx.picker.addPickable(m);
    }

    layer.ctx.scene.add(m);
    return m;
}