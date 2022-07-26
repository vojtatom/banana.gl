import * as THREE from 'three';
import { MaterialLibrary } from './material';
import { MapControls } from './controls';
import { Navigation } from './navigation';
import { GPUPicker } from './picker';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export type GraphicsProps = {
    canvas: HTMLCanvasElement;
    background?: number;
}

export class Graphics {
    readonly renderer: THREE.WebGLRenderer;
    readonly camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    readonly scene: THREE.Scene;
    readonly controls: MapControls;
    readonly materialLibrary;
    readonly picker: GPUPicker;
    readonly navigation: Navigation;
    private mouseLastDownTime = 0;
    readonly ssao: SSAOPass;

    needsRedraw = false;
    
    onClick: ((x: number, y: number, id: number) => void) | undefined;

    constructor(props: GraphicsProps) {
        const canvas = props.canvas;
        this.navigation = new Navigation();
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 10, 1000);
        this.scene = new THREE.Scene();
        this.controls = new MapControls(this.camera, canvas);
        this.materialLibrary = new MaterialLibrary(this.resolution);
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(props.background ?? 0xffffff, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        const composer = new EffectComposer( this.renderer );

        const ssaoPass = new SSAOPass( this.scene, this.camera );
        ssaoPass.normalMaterial.side = THREE.DoubleSide;
        ssaoPass.depthRenderMaterial.side = THREE.DoubleSide;
        ssaoPass.kernelRadius = 16;
        ssaoPass.maxDistance = 0.1;

        this.ssao = ssaoPass;
        composer.addPass( ssaoPass );

        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));


        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
        this.scene.add( ambientLight ); 

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        directionalLight.position.set( 0, 0, 1 );
        this.scene.add( directionalLight );

        this.picker = new GPUPicker(this.renderer);

        canvas.onmousedown = (e) => {
            this.mouseLastDownTime = Date.now();
            this.controls.onMouseDown();
        };

        canvas.onmouseup = (e) => {
            this.controls.onMouseUp();
            const now = Date.now();
            const duration = now - this.mouseLastDownTime;

            if (duration < 200)
            {
                const x = e.clientX;
                const y = e.clientY;
                this.picker.pick(x, y, this.camera);

                if (this.onClick) {
                    this.onClick(x, y, this.picker.id);
                }
            }

            this.navigation.setLocation(this.camera.position, this.controls.target);
        };

        canvas.addEventListener('wheel', (e) => {
            this.navigation.setLocation(this.camera.position, this.controls.target);
            this.updateCameraBoundries();
        }, {passive: true});


        const frame = () => {
            requestAnimationFrame(frame);
            this.controls.update();
            
            this.renderer.render(this.scene, this.camera);
            if (this.needsRedraw) {
                if (this.controls.changed)
                    this.renderer.render(this.scene, this.camera);
                else
                    composer.render();
            }

            //this.renderer.render(this.picker.pickingScene, this.camera);
        };

        frame();
    }

    private updateCameraBoundries() {
        const Z0 = -2000;
        const Z1 = 2000;
        //set camera far to intersect the 0 z-plane
        const camera = this.camera;
        const target = this.controls.target;
        const position = camera.position;
        const direction = target.clone().sub(position).normalize();
        
        const z0DistanceUnits = (position.z - Z0) / Math.abs(direction.z);
        const z0Target = position.clone().addScaledVector(direction, z0DistanceUnits);
        const z0Distance = z0Target.distanceTo(position) * Math.sign(z0DistanceUnits);

        const z1DistanceUnits = (position.z - Z1) / Math.abs(direction.z);
        const z1Target = position.clone().addScaledVector(direction, z1DistanceUnits);
        const z1Distance = z1Target.distanceTo(position) * Math.sign(z1DistanceUnits);
        
        camera.near = Math.max(z1Distance, 10);
        camera.far = Math.max(z0Distance, 4000);
        camera.updateProjectionMatrix();

        this.ssao.ssaoMaterial.uniforms.cameraNear.value = camera.near;
        this.ssao.ssaoMaterial.uniforms.cameraFar.value = camera.far;
        this.ssao.ssaoMaterial.uniformsNeedUpdate = true;
        this.ssao.depthRenderMaterial.uniforms.cameraNear.value = camera.near;
        this.ssao.depthRenderMaterial.uniforms.cameraFar.value = camera.far;
        this.ssao.depthRenderMaterial.uniformsNeedUpdate = true;

    }

    get resolution() {
        return this.renderer.getSize(new THREE.Vector2());
    }

    focus(location: THREE.Vector3, target: THREE.Vector3) {
        this.controls.target.copy(target);
        this.camera.position.copy(location);
        this.updateCameraBoundries();
    }

    miniload(model: string) {
        const loader = new GLTFLoader();
        loader.load(model, (gltf) => {
            const scene = gltf.scene;
            this.scene.add(scene);
            this.updateCameraBoundries();
        }, undefined, (error) => {
            console.error(error);
        }
        );
    }
} 


