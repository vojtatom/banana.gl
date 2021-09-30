import { useEffect, createRef } from "react";
import { useParams } from "react-router";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import iaxios from "../axios";
import Stats from 'three/examples/jsm/libs/stats.module';

type IBBox = [[number, number, number], [number, number, number]];
type IBRect = [[number, number], [number, number]];

interface IGrid {
    bbox: IBBox,
    id_counter: number,
    id_to_oid: { [id: number]: string },
    oid_to_id: { [ois: string]: number },
    resolution: [number, number],
    tile_size: number,
}

interface ILayer {
    grid: IGrid,
    name: string,
    shift: [number, number, number]
}

function square(x: number, y: number, z: number, side: number) {
    return new Float32Array( [
        x,        y,        z,
        x + side, y,        z,
        x + side, y + side, z,
        x + side, y + side, z,
        x,        y + side, z,
        x,        y,        z
    ] );
}

class Renderer {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    stats: Stats;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000000 );
        this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
        
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop( () => this.frame() );

        this.controls = new OrbitControls( this.camera, this.canvas );
        this.controls.dampingFactor = 0.2;
        this.controls.enableDamping = true;
        this.camera.position.z = 1000;


        this.stats = Stats()
        document.body.appendChild(this.stats.dom);
    }

    
    frame() {
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
        this.stats.update()
    }

    get focus_point() {
        return this.camera.position;
    }
}


class Tile {
    brect: IBRect;
    x: number;
    y: number;
    renderer: Renderer;
    mesh: THREE.Mesh|undefined;

    constructor(renderer: Renderer, x: number, y: number, brect: IBRect) {
        this.brect = brect;
        this.x = x;
        this.y = y;
        this.renderer = renderer;
        this.init();
    }

    init() {
        var randomColor = Math.floor(Math.random()*16777215)
        const material = new THREE.MeshBasicMaterial( {color: randomColor} );
        const vertices = square(this.brect[0][0], this.brect[0][1], 0, this.brect[1][0] - this.brect[0][0]);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        const plane = new THREE.Mesh( geometry, material );
        plane.visible = false;
        this.mesh = plane;
        this.renderer.scene.add(plane);
    }


}


function clamp(x: number, min: number, max: number){
    return Math.max(Math.min(x, max), min); 
}


class Grid implements IGrid{
    bbox: IBBox;
    id_counter: number;
    id_to_oid: { [id: number]: string };
    oid_to_id: { [ois: string]: number };
    resolution: [number, number];
    tile_size: number;
    tiles: {[x: number]: {[y: number]: Tile}};
    focused: {x: number, y: number};

    constructor(data: IGrid) {
        this.bbox = data.bbox;
        this.id_counter = data.id_counter;
        this.id_to_oid = data.id_to_oid;
        this.oid_to_id = data.oid_to_id;
        this.resolution = data.resolution;
        this.tile_size = data.tile_size;
        
        this.focused = {x: 0, y: 0};
        this.tiles = {}
    }

    addTile(tile: Tile) {
        if (!(tile.x in this.tiles))
            this.tiles[tile.x] = {}
        const x_list = this.tiles[tile.x]
        if (!(tile.y in x_list))
            x_list[tile.y] = tile;
    }

    focus(fx: number, fy: number) {
        const xid = (fx - this.bbox[0][0]) / this.tile_size;
        const xcid = clamp(Math.floor(xid), 0, this.resolution[0] - 1);
        const yid = (fy - this.bbox[0][1]) / this.tile_size;
        const ycid = clamp(Math.floor(yid), 0, this.resolution[1] - 1);
        const {x, y} = this.focused;
        if(x != xcid || y != ycid) {
            const newtile = this.tiles[xcid][ycid];
            const oldtile = this.tiles[x][y];
            if (newtile.mesh && oldtile.mesh) {
                newtile.mesh.visible = true;
                oldtile.mesh.visible = false;
                this.focused = {x: xcid, y: ycid};
            }
        } 


    }


}


class Layer implements ILayer{
    renderer: Renderer;
    grid: Grid;
    name: string;
    shift: [number, number, number];

    constructor(renderer: Renderer, data: ILayer) {
        this.renderer = renderer;
        this.grid = new Grid(data.grid);
        this.name = data.name;
        this.shift = data.shift;
        this.init();
    }

    init() {
        const ts = this.grid.tile_size;
        for(let x = 0; x < this.grid.resolution[0]; ++x){
            for(let y = 0; y < this.grid.resolution[1]; ++y) {
                const xbase = this.grid.bbox[0][0] + x * ts;
                const ybase = this.grid.bbox[0][1] + y * ts;
                const brect: IBRect = [[xbase, ybase], [xbase + ts, ybase + ts]];
                const tile = new Tile(this.renderer, x, y, brect);
                this.grid.addTile(tile);
            }
        }
    }

    focus(point: THREE.Vector3) {
        let x = point.x;
        let y = point.y;
        this.grid.focus(x, y);
    }
}


class MetacityEngine {
    project: string;
    canvas: HTMLCanvasElement;
    
    renderer: Renderer;
    layers: Layer[];

    constructor(project: string, canvas: HTMLCanvasElement) {
        this.project = project;
        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas);
        this.layers = [];
    }

    init() {
        console.log("init");
        iaxios.post('/layout', {name: this.project}).then((response) => {
            const data: ILayer[] = response.data;
            for(let ldata of data){
                let layer = new Layer(this.renderer, ldata);
                this.layers.push(layer);
            }
        });

        this.renderer.controls.addEventListener('change', (e: Event) => this.moved(e))
    }

    moved(e: Event) {
        const fp = this.renderer.focus_point;
        for (let layer of this.layers) {
            layer.focus(fp);
        }
    }
}


export function ProjectView() {
    const { name } = useParams<{name: string}>();
    const canvas = createRef<HTMLCanvasElement>();
    let renderer: MetacityEngine;
    
    useEffect(() => {
        if (canvas.current == null)
        return
        
        renderer = new MetacityEngine(name, canvas.current);
        renderer.init();
        renderer.renderer.frame();
      }, [canvas, name]);

    return (
        <div>
            <h1>Project View {name}</h1>
            <canvas ref={canvas}>Your browser does not support HTML5 canvas</canvas>
        </div>
    )
}