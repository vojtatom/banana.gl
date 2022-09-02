import * as THREE from 'three';
import { Navigation, NavigationProps } from './navigation';
import { GPUPicker } from './gpuPicker';
import { MetacityLoaderWorkerPool } from '../workers/poolMetacity';
import { createCopyrightLabel, CopyrightProps } from './copyright';
import { Renderer, RendererProps } from './renderer';
import { Lights, LightProps } from './lights';


export interface GraphicsProps extends NavigationProps, RendererProps, LightProps, CopyrightProps {
    metacityWorker: string;
}

export class GraphicContext {
    readonly renderer: Renderer;
    readonly scene: THREE.Scene;
    readonly labelScene: THREE.Scene;
    readonly navigation: Navigation;
    readonly lights: Lights;
    readonly picker: GPUPicker;
    readonly container: HTMLDivElement;

    readonly loaders: {
        metacity: MetacityLoaderWorkerPool;
    };

    constructor(props: GraphicsProps) {
        const container = createCopyrightLabel(props);
        if (!container)
            throw new Error('Cannot initialize renderer');
        this.container = container;

        this.renderer = new Renderer(props, container);
        this.scene = new THREE.Scene();
        this.labelScene = new THREE.Scene();
        this.navigation = new Navigation(props);
        this.picker = new GPUPicker(this.renderer.renderer, this.navigation.camera);
        this.lights = new Lights(props, this.scene);

        this.loaders = {
            metacity: new MetacityLoaderWorkerPool(props.metacityWorker),
        };

        const frame = async () => {
            this.navigation.controls.update();
            this.renderer.renderer.render(this.scene, this.navigation.camera);
            this.renderer.labelRenderer.render(this.labelScene, this.navigation.camera);
            requestAnimationFrame(frame);
            //renderer.render(picker.pickingScene, camera);
        };

        this.updateSize();
        frame();
    }

    updateSize() {
        let width, height;
        const { container } = this;
        
        if (container.parentNode) {
            let parent = container.parentNode as HTMLElement;
            width = parent.clientWidth;
            height = parent.clientHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        this.renderer.resize(width, height);
        this.navigation.controls.updateCamera(width, height);

        if (container) {
            container.style.width = width + 'px';
            container.style.height = height + 'px';    
        }
    };
}