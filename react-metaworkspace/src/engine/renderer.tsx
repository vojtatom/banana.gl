import * as THREE from 'three';
import { CSM } from 'three/examples/jsm/csm/CSM';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MapControls } from './controls';
import { GPUPickHelper } from './picker';
import { MaterialLibrary } from './shaders';
import { Style } from './style';


export class Renderer {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    pickingScene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    controls: MapControls;
    csm!: CSM;

    picker: GPUPickHelper;
    style: Style;

    matlib: MaterialLibrary;

    stats1: Stats;
    stats2: Stats;
    changed: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.pickingScene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.setupRenderer();
        this.controls = new MapControls(this.camera, this.canvas);
        this.setupLightsAndShadows();

        //materials
        this.matlib = new MaterialLibrary(this.csm);

        this.style = new Style({
            DOP_TSK_UlicUsPAKOM_l: {
                visible: false,
            }
        });

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
        this.scene.add(new THREE.HemisphereLight(0xdddddd, 0x555555, 0.6));
        this.scene.add(new THREE.AmbientLight(0xFFFFFF, 0.2));

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
    }

    private setupRenderer() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(() => this.frame());
    }

    frame() {
        this.controls.update();

        if (this.changed) {
            this.csm.update();
            this.renderer.shadowMap.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
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

    click(x: number, y: number) {
        const id = this.picker.pick(x, y, this.pickingScene, this.camera);
        console.log(id);
        console.log(this.picker.layerAndOidForId(id));

        this.matlib.polygonSelectMaterial.uniforms.selectedID = { value: this.picker.selected };
        this.matlib.polygonSelectMaterial.uniformsNeedUpdate = true;
        this.changed = true;
    }

    get focus_point() {
        return this.controls.target;
    }
}