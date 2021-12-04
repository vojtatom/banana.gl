import { Renderer } from './renderer';
import * as THREE from 'three';

export class Compas {
    renderer: Renderer;
    camDirection3: THREE.Vector3;
    camDirection2: THREE.Vector2;
    north: THREE.Vector2;
    angle: number;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.camDirection3 = new THREE.Vector3(0, 0, 0);
        this.camDirection2 = new THREE.Vector2(0, 0);
        this.north = new THREE.Vector2(0, 1);
        this.angle = 0;
    }


    update(callback?: (angle: number) => void) {
        this.camDirection3.copy(this.renderer.controls.target);
        this.camDirection3.sub(this.renderer.controls.camera.position);
        this.camDirection3.normalize();
        this.camDirection2.set(this.camDirection3.x, this.camDirection3.y);

        if (this.renderer.controls.camera.up.y === 1) {
            this.angle = 0;
        } else {
            this.camDirection2.normalize();
            this.angle = Math.acos(this.north.dot(this.camDirection2));
            if (this.camDirection2.x < 0) {
                this.angle = -this.angle;
            }
        }

        if (callback) {
            callback(this.angle);
        }
    }
}