import * as THREE from "three";
import { colorHex } from "../style/color";
import { circleTriangulated } from "./circle";


export function nodeInstance(radius: number, color: number, opacity: number) {
    const positions = circleTriangulated(radius, 20, 2);
    const normals = new Float32Array(positions.length);
    for (let i = 0; i < normals.length; i += 3) {
        normals[i] = 0;
        normals[i + 1] = 0;
        normals[i + 2] = 1;
    }
    const colorArr = colorHex(color);
    const colors = new Float32Array(positions.length);
    for (let i = 0; i < colors.length; i += 3) {
        colors[i] = colorArr[0];
        colors[i + 1] = colorArr[1];
        colors[i + 2] = colorArr[2];
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
    });

    return new THREE.Mesh(geometry, material);
}