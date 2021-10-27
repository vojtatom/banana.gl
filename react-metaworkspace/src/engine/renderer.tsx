import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSM } from 'three/examples/jsm/csm/CSM';
import Stats from 'three/examples/jsm/libs/stats.module';
import { select_phong_material, picking_material, line_material } from './shaders'


class MapControls extends OrbitControls {

	constructor( camera: THREE.PerspectiveCamera, domElement: HTMLCanvasElement ) {

        camera.up = new THREE.Vector3(0, 0, 1);
		super( camera, domElement );

		this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

		this.mouseButtons.LEFT = THREE.MOUSE.PAN;
		this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

		this.touches.ONE = THREE.TOUCH.PAN;
		this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

	}
}



class GPUPickHelper {
    pickingTexture: THREE.WebGLRenderTarget;
    pixelBuffer: Uint8Array;
    renderer: THREE.WebGLRenderer;

    selected: number[];
    id: number;

    constructor(renderer: THREE.WebGLRenderer) {
    // create a 1x1 pixel render target
        this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
        this.pixelBuffer = new Uint8Array(4);
        this.renderer = renderer;
        this.selected = [-1, -1, -1, -1];
        this.id = -1;
    }

    pick(x: number, y: number, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        const {pickingTexture, pixelBuffer} = this;
        
        // set the view offset to represent just a single pixel under the mouse
        const pixelRatio = this.renderer.getPixelRatio();
        camera.setViewOffset(
            this.renderer.getContext().drawingBufferWidth,   // full width
            this.renderer.getContext().drawingBufferHeight,  // full top
            x * pixelRatio | 0,             // rect x
            y * pixelRatio | 0,             // rect y
            1,                                          // rect width
            1,                                          // rect height
        );
        // render the scene
        this.renderer.setRenderTarget(pickingTexture)
        this.renderer.render(scene, camera);
        this.renderer.setRenderTarget(null);
        
        // clear the view offset so rendering returns to normal
        camera.clearViewOffset();
        //read the pixel
        this.renderer.readRenderTargetPixels(
            pickingTexture,
            0,   // x
            0,   // y
            1,   // width
            1,   // height
            pixelBuffer);
        
        this.selected = [ pixelBuffer[0] / 255, pixelBuffer[1] / 255, pixelBuffer[2] / 255, pixelBuffer[3] / 255];
        this.id = new DataView(pixelBuffer.buffer).getUint32(0, true);
        return this.id;
    }
}

export class Renderer {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    pickingScene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: MapControls;
    csm: CSM;

    picker: GPUPickHelper;

    material: THREE.ShaderMaterial;
    lineMaterial: THREE.RawShaderMaterial;
    pickingMaterial: THREE.ShaderMaterial;

    stats1: Stats;
    stats2: Stats;
    changed: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.pickingScene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

        //this.scene.fog = new THREE.Fog(0xffffff, 150, 250);
        this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop( () => this.frame() );

        this.controls = new MapControls( this.camera, this.canvas );
        this.controls.zoomSpeed = 0.5;
        this.controls.dampingFactor = 0.2;
        this.controls.enableDamping = true;
        this.controls.minDistance = 5;
        this.controls.minPolarAngle = 0.001;
        //this.controls.maxPolarAngle = Math.PI * 0.4;
        this.controls.update();

        this.scene.add(new THREE.HemisphereLight( 0xdddddd, 0x555555, 0.6 ));
        this.scene.add(new THREE.AmbientLight( 0xFFFFFF, 0.2 ));

        this.csm = new CSM({
            fade: true,
            mode: 'practical',
            cascades: 4,
            near: 1,
            far: 5000,
            shadowBias: -0.0005,
            shadowMapSize: 2048,
            lightDirection: new THREE.Vector3(-1, -1, -2).normalize(),
            camera: this.camera,
            parent: this.scene,
            margin: 5000,
            lightFar: 20000,
            lightNear: 1,
            lightIntensity: 0.3
        });

        //materials
        this.material = select_phong_material();
        this.csm.setupMaterial( this.material );
        this.pickingMaterial = picking_material();
        this.lineMaterial = line_material();

        this.lineMaterial.onBeforeCompile = (shader, renderer) => {
            console.log(shader);
        }

        //this.csm.setupMaterial( this.lineMaterial );

        //picker
        this.picker = new GPUPickHelper(this.renderer);
        this.changed = true;
        
        //devstats
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
        
        if(this.changed) {
            this.csm.update();
            this.renderer.shadowMap.needsUpdate = true;
            this.renderer.render( this.scene, this.camera );
        }
        
        this.stats1.update()
        this.stats2.update()
        this.changed = false;
    }
    
    focus(focusPoint: THREE.Vector2) {
        this.controls.target = new THREE.Vector3(focusPoint.x, focusPoint.y, 0);
        this.camera.position.x = focusPoint.x;
        this.camera.position.y = focusPoint.y - 20;
        this.camera.position.z = 1000;   
    }

    click(x: number, y: number){
        const id = this.picker.pick(x, y, this.pickingScene, this.camera);
        this.material.uniforms.selectedID = {value: this.picker.selected};
        this.material.uniformsNeedUpdate = true;
        this.changed = true;
    }

    get focus_point() {
        return this.controls.target;
    }
}