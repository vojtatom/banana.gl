import { useEffect, createRef } from "react";
import { useParams } from "react-router";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import iaxios from "../axios";
import Stats from 'three/examples/jsm/libs/stats.module';

interface IGrid {
    bbox: [[number, number, number], [number, number, number]],
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

    layout_grid(grid: IGrid) {
        var randomColor = Math.floor(Math.random()*16777215)
        const material = new THREE.MeshBasicMaterial( {color: randomColor} );
        for(let x = 0; x < Math.min(grid.resolution[0], 3); ++x){
            for(let y = 0; y < Math.min(grid.resolution[1], 3); ++y) {
                const vertices = square(x * grid.tile_size, y * grid.tile_size, 0, grid.tile_size / 2);
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
                const plane = new THREE.Mesh( geometry, material );
                this.scene.add(plane);
            }
        }
    }
    
    frame() {
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
        this.stats.update()
    }
}


class Layer implements ILayer{
    renderer: Renderer;
    grid: IGrid;
    name: string;
    shift: [number, number, number];

    constructor(renderer: Renderer, spec: ILayer) {
        this.renderer = renderer;
        this.grid = spec.grid;
        this.name = spec.name;
        this.shift = spec.shift;
        this.init();
    }

    init() {
        this.renderer.layout_grid(this.grid);   
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