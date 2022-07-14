import * as THREE from 'three';
import { MaterialLibrary, MaterialLibraryProps } from './material';
import { MapControls } from './controls';
import { Navigation } from './navigation';
import { GPUPicker } from './picker';


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
    private mouseLastDownTime = 0;
    
    onClick: ((x: number, y: number, id: number) => void) | undefined;

    constructor(props: GraphicsProps) {
        const canvas = props.canvas;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100000);
        this.scene = new THREE.Scene();
        this.controls = new MapControls(this.camera, canvas);
        this.materialLibrary = new MaterialLibrary(this.resolution);
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(props.background ?? 0xffffff, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        

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
        }

        canvas.onmouseup = (e) => {
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

            const target = this.controls.target;
            Navigation.Instance.setLocation(target.x, target.y);
        };

        const frame = () => {
            requestAnimationFrame(frame);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            //this.renderer.render(this.picker.pickingScene, this.camera);
        };

        frame();
    }

    get resolution() {
        return this.renderer.getSize(new THREE.Vector2());
    }

    focus(x: number, y: number) {
        console.log("focusing:", x, y);
        this.controls.target = new THREE.Vector3(x, y, 0);
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = 1000;
    }
} 


