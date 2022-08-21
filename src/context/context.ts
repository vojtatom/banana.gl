import * as THREE from 'three';
import { Navigation, NavigationProps } from './navigation';
import { GPUPicker } from './gpuPicker';
import { MapControls, MapControlsProps } from './mapControls';
import { LoaderWorkerPool } from '../loader/loader';
import { SourceLabel } from './label';


function Renderer(props: GraphicsProps) {
    const renderer = new THREE.WebGLRenderer({
        canvas: props.canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setClearColor(props.background!, 1);
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

export interface GraphicsProps extends NavigationProps, MapControlsProps {
    canvas: HTMLCanvasElement;
    loaderPath: string;
    background?: number;
    near?: number;
    far?: number;
}


export interface GraphicContext {
    navigation: Navigation;
    scene: THREE.Scene;
    picker: GPUPicker;
    loader: LoaderWorkerPool;
    updateSize: () => void;
    get resolution(): THREE.Vector2;
}


function propsDefaults(props: GraphicsProps) {
    props.near = props.near ?? 1000;
    props.far = props.far ?? 100000;
    props.background = props.background ?? 0xffffff;
}


export function GraphicContext(props: GraphicsProps) : GraphicContext {
    propsDefaults(props);
    const canvas = props.canvas;
    const renderer = Renderer(props);
    const ratio = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(5, ratio, props.near, props.far);
    const scene = new THREE.Scene();
    const picker = GPUPicker(renderer, camera);
    const controls = new MapControls(props, camera, canvas);
    const lights = Lights(scene);
    const navigation = Navigation(props, camera, controls);
    const loader = LoaderWorkerPool(props.loaderPath);
    const container = SourceLabel(props);

    const frame = () => {
        requestAnimationFrame(frame);
        controls.update();
        renderer.render(scene, camera);
        //renderer.render(picker.pickingScene, camera);
    };

    const updateSize = () => {
        let width, height;
        
        if (container?.parentNode) {
            let parent = container.parentNode as HTMLElement;
            width = parent.clientWidth;
            height = parent.clientHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        const ratio = width / height;
        camera.aspect = ratio;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        if (container) {
            container.style.width = width + 'px';
            container.style.height = height + 'px';    
        }
    };

    updateSize();
    frame();

    return {
        scene,
        picker,
        navigation,
        loader,
        updateSize,
        get resolution() {
            return renderer.getSize(new THREE.Vector2());
        }
    };
}