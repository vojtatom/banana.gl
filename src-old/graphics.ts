import * as THREE from 'three';
import { MaterialLibrary } from './material';
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
    readonly navigation: Navigation;
    private mouseLastDownTime = 0;

    needsRedraw = false;
    
    onClick: ((x: number, y: number, id: number) => void) | undefined;

    constructor(props: GraphicsProps) {
        const canvas = props.canvas;
        this.navigation = new Navigation();
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        this.camera = new THREE.PerspectiveCamera(5, canvas.clientWidth / canvas.clientHeight, 10, 100000);
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
        }, {passive: true});


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

    focus(target: THREE.Vector3, location?: THREE.Vector3 ) {
        console.log(target);
        if (!location)
        {
            location = target.clone()
            const offset = new THREE.Vector3(-2000, 2000, 2000);
            location.add(offset);
        }
        this.controls.target.copy(target);
        this.camera.position.copy(location);
        this.navigation.setLocation(this.camera.position, this.controls.target);
    }
} 


