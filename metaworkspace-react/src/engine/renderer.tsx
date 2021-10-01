import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';


export class Renderer {
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
        this.scene.fog = new THREE.Fog(0xffffff, 1000, 100000);
        this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
        
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop( () => this.frame() );

        this.controls = new OrbitControls( this.camera, this.canvas );
        this.controls.dampingFactor = 0.2;
        this.controls.enableDamping = true;
        this.camera.position.z = 10000;

        this.scene.add(new THREE.HemisphereLight( 0xffffff, 0x555555, 1 ));
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set(1, 1, 0);
        directionalLight.castShadow = true;
        this.scene.add( directionalLight );

        //Set up shadow properties for the light
        directionalLight.shadow.mapSize.width = 512; // default
        directionalLight.shadow.mapSize.height = 512; // default
        directionalLight.shadow.camera.near = 0.5; // default
        directionalLight.shadow.camera.far = 500; // default


        this.stats = Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);
    }

    
    frame() {
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
        this.stats.update()
    }

    get focus_point() {
        return this.controls.target;
    }
}