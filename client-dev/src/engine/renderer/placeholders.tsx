import * as THREE from 'three';
import { toSpiral } from '../utils/indexing';
import { Renderer } from './renderer';


function getRandomColor() {
    var letters = '89ABCDEF';
    var color = '';
    let a = Math.floor(Math.random() * 7);
    let b = Math.floor(Math.random() * 7);
    for (var i = 0; i < 3; i++) {
        color += letters[a];
        color += letters[b];
    }
    return color;
}



export class GridPlaceholders {
    placeholders: Map<number, THREE.Mesh>;
    visibilityMap: Map<number, number>

    renderer: Renderer

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.placeholders = new Map();
        this.visibilityMap = new Map();
    }

    genPlaceholder(x: number, y: number) {
        const xdim = 1000;
        const ydim = 1000;
        const geometry = new THREE.PlaneGeometry(xdim, ydim);
        const color = getRandomColor();
        const material = new THREE.MeshBasicMaterial({ color: parseInt(color, 16), opacity: 0.1, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x * 1000 + xdim / 2, y * 1000 + ydim / 2, 0);
        mesh.visible = true;
        return mesh;
    }

    addPlaceholder(x: number, y: number) {
        const index = toSpiral(x, y);
        const plc = this.placeholders.get(index);

        if (plc !== undefined) {
            return;
        }

        const placeholder = this.genPlaceholder(x, y);
        this.placeholders.set(index, placeholder);
        this.renderer.scene.add(placeholder);
    }

    hidePlaceholder(x: number, y: number) {
        const index = toSpiral(x, y);
        let count = this.visibilityMap.get(index);

        if (count === undefined)
            count = 0;

        this.visibilityMap.set(index, count + 1);

        if (count >= 0) {
            (this.placeholders.get(index) as THREE.Mesh).visible = false;
        }
    }

    showPlaceholder(x: number, y: number) {
        const index = toSpiral(x, y);
        let count = this.visibilityMap.get(index);

        if (count === undefined)
            return;

        this.visibilityMap.set(index, count - 1);

        if (count - 1 === 0) {
            (this.placeholders.get(index) as THREE.Mesh).visible = true;
        }
    }


}