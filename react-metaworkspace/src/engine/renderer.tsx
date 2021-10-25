import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSM } from 'three/examples/jsm/csm/CSM';
import Stats from 'three/examples/jsm/libs/stats.module';
import { INVSCALE } from './types';

export class Renderer {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    csm: CSM;


    material: THREE.MeshToonMaterial;

    stats1: Stats;
    stats2: Stats;

    target_z: number;
    changed: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );

        //this.scene.fog = new THREE.Fog(0xffffff, 1000, 100000);
        this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop( () => this.frame() );

        this.controls = new OrbitControls( this.camera, this.canvas );
        this.controls.zoomSpeed = 0.1;
        this.controls.dampingFactor = 0.2;
        this.controls.enableDamping = true;
        this.controls.minDistance = 5;
        this.controls.update();

        this.scene.add(new THREE.HemisphereLight( 0xdddddd, 0x555555, 0.7 ));
        this.scene.add(new THREE.AmbientLight( 0xFFFFFF, 0.3 ));
        //const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        //this.scene.add( directionalLight );

        this.csm = new CSM({
            fade: false,
            far: 100,
            mode: 'practical',
            cascades: 3,
            shadowMapSize: 2048,
            lightDirection: new THREE.Vector3(-1, -1, -1).normalize(),
            camera: this.camera,
            parent: this.scene,
            lightIntensity: 0.3,
        });

        this.material = new THREE.MeshToonMaterial( { color: '#FFFFFF', side: THREE.DoubleSide } );
        this.csm.setupMaterial( this.material );

        this.target_z = 0;
        this.changed = true;
        
        this.stats1 = Stats();
        this.stats1.showPanel(0);
        this.stats1.dom.style.cssText = 'position:absolute;top:0px;left:0px;';
        document.body.appendChild(this.stats1.dom);
        this.stats2 = Stats();
        this.stats2.showPanel(1);
        this.stats2.dom.style.cssText = 'position:absolute;top:0px;left:80px;';
        document.body.appendChild(this.stats2.dom);
    }

    
    frame() {
        this.controls.update();
        
        if(this.changed)
            this.renderer.render( this.scene, this.camera );

        this.stats1.update()
        this.stats2.update()
        this.changed = false;
    }

    focus(focusPoint: THREE.Vector2) {
        this.controls.target = new THREE.Vector3(focusPoint.x, focusPoint.y, 0);
        this.camera.position.x = focusPoint.x;
        this.camera.position.y = focusPoint.y - 20;
        this.camera.position.z = 1000 * INVSCALE;

        this.target_z = this.controls.target.z;
    }

    updateOnMove() {
        this.changed = true;

        if (this.target_z !== this.controls.target.z)
        {
            const delta = this.controls.target.z - this.target_z;
            this.controls.target.z = this.target_z;
            this.camera.position.z -= delta;
        }
        
        this.csm.update();
    }

    get focus_point() {
        return this.controls.target;
    }
}