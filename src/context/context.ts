import * as THREE from 'three';
import { Navigation, NavigationProps } from './navigation';
import { GPUPicker } from './gpuPicker';
import { MapControls, MapControlsProps } from './mapControls';
import { LoaderWorkerPool } from '../loader/loader';
import { SourceLabel } from './copyright';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';


function Renderer(props: GraphicsProps, container: HTMLElement) {
    const renderer = new THREE.WebGLRenderer({
        canvas: props.canvas,
        antialias: false,
        powerPreference: 'high-performance'
    });
    renderer.setClearColor(props.background!, 1);
    renderer.setPixelRatio(window.devicePixelRatio);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.prepend(labelRenderer.domElement);

    return {
        renderer,
        labelRenderer
    }
}

export interface GraphicsProps extends NavigationProps, MapControlsProps {
    canvas: HTMLCanvasElement;
    loaderPath: string;
    background?: number;
    near?: number;
    far?: number;
    lightIntensity?: number;
    ambientLightIntensity?: number;
    directionalLightIntensity?: number;
    invertCopyrightColor?: boolean;
}

function Lights(props: GraphicsProps, scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, props.ambientLightIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, props.directionalLightIntensity);
    directionalLight.position.set(0, 0, 10);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    return [ambientLight, directionalLight];
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
    props.ambientLightIntensity = props.ambientLightIntensity ?? 0.5;
    props.directionalLightIntensity = props.directionalLightIntensity ?? 0.5;
    if (props.lightIntensity) {
        props.ambientLightIntensity = props.lightIntensity;
        props.directionalLightIntensity = props.lightIntensity;
    }
}


export function GraphicContext(props: GraphicsProps) : GraphicContext {
    propsDefaults(props);
    const canvas = props.canvas;
    const container = SourceLabel(props);
    if (!container)
        throw new Error('Cannot initialize renderer');

    const { renderer, labelRenderer } = Renderer(props, container);
    const ratio = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(5, ratio, props.near, props.far);
    const scene = new THREE.Scene();
    const picker = GPUPicker(renderer, camera);
    const controls = new MapControls(props, camera, canvas);
    const lights = Lights(props, scene);
    const navigation = Navigation(props, camera, controls);
    const loader = LoaderWorkerPool(props.loaderPath);

    const frame = () => {
        requestAnimationFrame(frame);
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
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
        labelRenderer.setSize(width, height);
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