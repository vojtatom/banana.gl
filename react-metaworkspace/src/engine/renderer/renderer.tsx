import * as THREE from 'three';
import { CSM } from './csm/CSM';
import { CSMHelper } from './csm/CSMHelper';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GPUPickHelper } from './picker';
import { MaterialLibrary } from './shaders';
import { CameraControls } from './camera'



export class Renderer {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    pickingScene: THREE.Scene;
    renderer: THREE.WebGLRenderer;

    controls: CameraControls;
    picker: GPUPickHelper;
    matlib: MaterialLibrary;
    csm!: CSM;
    helper!: CSMHelper;

    stats1: Stats;
    stats2: Stats;
    changed: boolean;

    updateLights = true;

    actionCall: CallableFunction;

    trim = 0;

    constructor(canvas: HTMLCanvasElement, actionCall: CallableFunction) {
        this.canvas = canvas;
        this.actionCall = actionCall;

        //basic threejs
        this.scene = new THREE.Scene();
        this.pickingScene = new THREE.Scene();
        this.controls = new CameraControls(this.canvas);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.setupRenderer();
        this.setupLightsAndShadows();
        this.controls.initOrthographic(this.canvas, this.csm);
        
        //materials
        this.matlib = new MaterialLibrary(this.csm);
        
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


    private setupLightsAndShadows() {
        const hemisphere = new THREE.HemisphereLight(0xFFFFFF, 0x555555, 0.4);
        hemisphere.position.set(0, 1, 1);
        this.scene.add(hemisphere);
        this.scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5));

        this.csm = new CSM({
            fade: true,
            mode: 'practical',
            cascades: 4,
            shadowBias: [-0.0005, -0.001, -0.001, -0.002],
            shadowMapSize: 2048,
            lightDirection: new THREE.Vector3(-1, -1, -1).normalize(),
            camera: this.controls.camera,
            parent: this.scene,
            lightNear: 1,
            lightFar: 10000,
            maxFar: 5000,
            margin: 0,
            lightIntensity: 0.2,
            autoUpdateHelper: false
        });

        this.helper = new CSMHelper(this.csm);
        this.helper.visible = true;
        this.scene.add(this.helper);
        this.helper.update();
    }

    private setupRenderer() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.setClearColor(0xa6fff3);
        //this.renderer.setClearColor(0xbdfff6);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.frame());
    }

    frame() {
        this.actionCall();
        this.controls.update();
        
        if (this.changed) {
            if (this.updateLights) {
                this.csm.update();
                this.renderer.shadowMap.needsUpdate = true;
            }

            this.renderer.render(this.scene, this.controls.camera);
        }

        this.stats1.update()
        this.stats2.update()
        this.changed = false;
    }

    click(x: number, y: number) {
        const id = this.picker.pick(x, y, this.pickingScene, this.controls.camera);
        console.log(id);
        console.log(this.picker.layerAndOidForId(id));
        this.matlib.polygonSelectMaterial.uniforms.selectedID = { value: this.picker.selected };
        this.matlib.polygonSelectMaterial.uniformsNeedUpdate = true;
        this.changed = true;
        return this.controls.screenToWorldOrthographic(x, y);
    }

    updateHelper() {
        this.helper.update();
        this.updateLights = false;
        this.changed = true;
    }
}