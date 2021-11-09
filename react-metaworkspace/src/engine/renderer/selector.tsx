import { Renderer } from './renderer'
import * as THREE from 'three';


enum Stage {
    NOSELECT,
    SELECT,
    SELECTEDFIRST
}

function wirebox(width: number, height: number, depth: number ) {
    width = width * 0.5;
    height = height * 0.5;
    depth = depth * 0.5;

    const geometry = new THREE.BufferGeometry();
    const position = [];

    position.push(
        - width, - height, - depth,
        - width, height, - depth,

        - width, height, - depth,
        width, height, - depth,

        width, height, - depth,
        width, - height, - depth,

        width, - height, - depth,
        - width, - height, - depth,

        - width, - height, depth,
        - width, height, depth,

        - width, height, depth,
        width, height, depth,

        width, height, depth,
        width, - height, depth,

        width, - height, depth,
        - width, - height, depth,

        - width, - height, - depth,
        - width, - height, depth,

        - width, height, - depth,
        - width, height, depth,

        width, height, - depth,
        width, height, depth,

        width, - height, - depth,
        width, - height, depth
     );

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
    return geometry;
}


export class Selector {

    renderer: Renderer;
    status: Stage = Stage.NOSELECT;
    cube: THREE.LineSegments;
    ends: THREE.Vector2[];

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        const geometry = wirebox(1, 1, 1);
        const material = new THREE.LineDashedMaterial( {
            color: 0x000000,
            dashSize: 3, gapSize: 1
        } );

        this.cube = new THREE.LineSegments( geometry, material );
        this.renderer.scene.add( this.cube );
        this.ends = [];
        this.cube.visible = false;
    }

    select(x: number, y: number) {
        this.ends.push(new THREE.Vector2(x, y));
        this.cube.visible = true;
        this.renderer.changed = true;
        
        if (this.ends.length < 2)
        {
            this.cube.position.x = x;
            this.cube.position.y = y;
            this.cube.position.z = 0;
            this.cube.scale.set(10, 10, 1000);
            this.cube.updateMatrixWorld();

            return {
                start: [x, y]
            }
        } else {
            const end: THREE.Vector2 = this.ends.pop() as any;
            const tmp: THREE.Vector2 = this.ends.pop() as any;
            const start = new THREE.Vector2(end.x, end.y);
            start.min(tmp);
            end.max(tmp);
            tmp.copy(end).sub(start); //tmp is now size

            this.cube.scale.set(tmp.x, tmp.y, 1000);
            this.cube.position.set(start.x + tmp.x * 0.5, start.y + tmp.y * 0.5, 0);
            this.cube.updateMatrixWorld();

            return {
                start: [start.x, start.y],
                end: [end.x, end.y],
                size: [tmp.x, tmp.y]
            }
        }
    }

    clear() {
        this.cube.visible = false;
        this.renderer.changed = true;
    }
}


