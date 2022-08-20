import * as THREE from 'three';
import { ParsedData, ParsedPoints } from '../../loader/worker';
import { CullableInstancedMesh } from '../cullable';
import { Layer } from '../layer';


function computeBoundingSphere(points: ParsedPoints) {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(points.positions, 3));
    buffer.computeBoundingSphere();
    const bsphere = buffer.boundingSphere?.clone() ?? new THREE.Sphere();
    return bsphere;
}


function InstancedPoints(points: ParsedPoints, layer: Layer, pointInstance: THREE.Mesh[]) {
    const matrix = new THREE.Matrix4();
    const bsphere = computeBoundingSphere(points);
    let meshes: CullableInstancedMesh[] = [];
    
    pointInstance.forEach(initInstance);
    function initInstance(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>) {
        const geometry = mesh.geometry.clone();
        const count = points.positions.length / 3;
        const instancedMesh = new CullableInstancedMesh(geometry, mesh.material, bsphere, count);
        for (let i = 0; i < points.positions.length; i += 3) {
            initInstanceMatrix(matrix, i);
            instancedMesh.setMatrixAt(i / 3, matrix);
        }
        layer.ctx.scene.add(instancedMesh);
        meshes.push(instancedMesh);
    }

    return meshes;

    function initInstanceMatrix(matrix: THREE.Matrix4, i: number) {
        matrix.identity();
        matrix.setPosition(points.positions[i], points.positions[i + 1], points.positions[i + 2]);
    }
}


function Points(points: ParsedPoints, layer: Layer) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points.positions, 3));
    geometry.setAttribute('idcolor', new THREE.BufferAttribute(points.ids, 3));
    const m = new THREE.Points(geometry, layer.materials.point);
    layer.ctx.scene.add(m);
    return m;
}

export function PointsGeometry(data: ParsedData, layer: Layer, pointInstance?: THREE.Mesh[]) {
    if (!data.points)
        return;

    const { points } = data;

    if (pointInstance) {
        return InstancedPoints(points, layer, pointInstance);
    } else {
        return Points(points, layer);
    }
}


