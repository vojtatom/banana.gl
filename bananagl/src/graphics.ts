import * as THREE from 'three';
import { MaterialLibrary } from './material';
import { MapControls } from './controls';
import { Navigation } from './navigation';


export class Graphics {
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    scene: THREE.Scene;
    controls: MapControls;
    materialLibrary = new MaterialLibrary();
    focused: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100000);
        this.scene = new THREE.Scene();
        this.controls = new MapControls(this.camera, canvas);
    
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(0xffffff, 1);


        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));


        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.4 );
        this.scene.add( ambientLight ); 

        const dirLight = new THREE.DirectionalLight( 0xefefff, 0.5 );
        dirLight.position.set( 10, 10, 10 );
        dirLight.target.position.set( 0, 0, 0 );
        this.scene.add( dirLight );


        canvas.onmouseup = (e) => {
            const target = this.controls.target;
            Navigation.Instance.setLocation(target.x, target.y);
        };

        const frame = () => {
            requestAnimationFrame(frame);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }

        frame();
    }

    focus(x: number, y: number, z: number) {
        if (this.focused) {
            return;
        }

        this.controls.target = new THREE.Vector3(x, y, 0);
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = 1000;
        this.focused = true;
    }
} 


