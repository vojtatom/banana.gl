import * as THREE from 'three';
import { Navigation, NavigationProps } from './navigation';
import { GPUPicker } from './gpuPicker';
import { MapControls } from './mapControls';
import { LoaderWorkerPool } from '../loader/loader';


export interface GraphicsProps extends NavigationProps {
    canvas: HTMLCanvasElement;
    loaderPath: string;
    stylerPath: string;
    background?: number;
}


function Renderer(props: GraphicsProps) {
    const renderer = new THREE.WebGLRenderer({
        canvas: props.canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(props.canvas.clientWidth, props.canvas.clientHeight);
    renderer.setClearColor(props.background ?? 0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);

    return renderer;
}


function Lights(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);
    return [ambientLight, directionalLight];
}


export interface GraphicContext {
    navigation: Navigation;
    scene: THREE.Scene;
    picker: GPUPicker;
    loader: LoaderWorkerPool;
    get resolution(): THREE.Vector2;
}


export function GraphicContext(props: GraphicsProps) : GraphicContext {
    const canvas = props.canvas;
    const renderer = Renderer(props);
    const ratio = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(5, ratio, 10, 100000);
    const scene = new THREE.Scene();
    const picker = GPUPicker(renderer, camera);
    const controls = new MapControls(camera, canvas);
    const lights = Lights(scene);
    const navigation = Navigation(props, camera, controls);
    const loader = LoaderWorkerPool(props.loaderPath);

    const frame = () => {
        requestAnimationFrame(frame);
        controls.update();
        renderer.render(scene, camera);
        //this.renderer.render(this.picker.pickingScene, this.camera);
    };

    frame();

    return {
        scene,
        picker,
        navigation,
        loader,
        get resolution() {
            return renderer.getSize(new THREE.Vector2());
        }
    };
}