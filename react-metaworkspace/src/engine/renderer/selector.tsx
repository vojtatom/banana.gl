import { Renderer } from './renderer'
import * as THREE from 'three';
import { AreaSelection } from '../types';

export class Selector {

    renderer: Renderer;
    cube: THREE.Mesh;
    ends: THREE.Vector2[];
    region?: AreaSelection;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const material = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.5
        });

        this.cube = new THREE.Mesh( geometry, material );
        this.renderer.scene.add( this.cube );
        this.ends = [];
        this.cube.visible = false;
    }

    select(x: number, y: number) {
        const v = this.renderer.controls.screenToWorldOrthographic(x, y);
        if (!v)
            return;

        this.ends.push(new THREE.Vector2(v.x, v.y));

        this.cube.visible = true;
        this.renderer.changed = true;
        
        if (this.ends.length < 2)
            return this.initCube(v);
        else
            return this.transformCube();
    }

    private transformCube() {
        const end: THREE.Vector2 = this.ends.pop() as any;
        const tmp: THREE.Vector2 = this.ends[0].clone() as any;
        const start = new THREE.Vector2(end.x, end.y);

        start.min(tmp);
        end.max(tmp);
        tmp.copy(end).sub(start); //tmp is now size

        this.cube.scale.set(tmp.x, tmp.y, 1);
        this.cube.position.set(start.x + tmp.x * 0.5, start.y + tmp.y * 0.5, this.renderer.controls.camera.position.z - 10);
        this.cube.updateMatrixWorld();
        this.region = {
            start: [start.x, start.y],
            end: [end.x, end.y],
            size: [tmp.x, tmp.y]
        };
    }

    private initCube(v: THREE.Vector3) {
        this.cube.position.x = v.x;
        this.cube.position.y = v.y;
        this.cube.position.z = 0;
        this.cube.scale.set(1, 1, 1);
        this.cube.updateMatrixWorld();
    }

    clear() {
        this.ends = [];
        this.cube.visible = false;
        this.renderer.changed = true;
        this.region = undefined;
    }
}


