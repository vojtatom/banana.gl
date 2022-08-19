import { Layer } from '../layer';
import * as THREE from 'three';
import { StylerWorkerPool } from '../styles';
import { ParsedGeometry } from '../types';



export class MeshGeometry {
    constructor(layer: Layer, parsedGeometry: ParsedGeometry) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(parsedGeometry.positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(parsedGeometry.normals, 3));
        geometry.setAttribute('idcolor', new THREE.BufferAttribute(parsedGeometry.ids, 3));
        const m = new THREE.Mesh(geometry, layer.materialLibrary.default);
        layer.graphics.scene.add(m);
        layer.graphics.needsRedraw = true;

        layer.styles.forEach((style) => {
            StylerWorkerPool.Instance.process({
                style: style,
                metadata: parsedGeometry.metadata,
                ids: parsedGeometry.ids
            }, (results) => {
                const { color } = results;
                geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
                layer.materialLibrary.default.vertexColors = true;
                layer.materialLibrary.default.needsUpdate = true;
                layer.graphics.needsRedraw = true;
            });
        });

        if (layer.pickable) {
            layer.graphics.picker.addPickable(m);
        }
    }
}
