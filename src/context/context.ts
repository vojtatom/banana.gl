import * as THREE from 'three';
import { Navigation, NavigationProps } from './navigation';
import { GPUPicker } from './gpuPicker';
import { MetacityLoaderWorkerPool } from '../pools/poolMetacity';
import { createCopyrightLabel, CopyrightProps } from './copyright';
import { Renderer, RendererProps } from './renderer';
import { Lights, LightProps } from './lights';
import { FluxWorkerPool } from '../pools/poolFlux';


export interface GraphicsProps extends NavigationProps, RendererProps, LightProps, CopyrightProps {
    metacityWorker?: string;
    fluxWorker?: string;
}

export class GraphicContext {
    readonly renderer: Renderer;
    readonly scene: THREE.Scene;
    readonly labelScene: THREE.Scene;
    readonly navigation: Navigation;
    readonly lights: Lights;
    readonly picker: GPUPicker;
    readonly container: HTMLDivElement;

    private time_: number = 0;
    private timeMax_: number = 1;

    readonly workers: {
        metacity: MetacityLoaderWorkerPool;
        flux: FluxWorkerPool;
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

        this.workers = {
            metacity: new MetacityLoaderWorkerPool(props.metacityWorker ?? 'metacityWorker.js'),
            flux: new FluxWorkerPool(props.fluxWorker ?? 'fluxWorker.js'),
        };

        let time = Date.now();
        const frame = async () => {
            //time management
            //const delta = (Date.now() - time) / 1000;
            const delta = 1;
            time = Date.now();
            this.time_ =  (this.time_ + delta) % this.timeMax_;
            this.scene.userData.time = this.time_;

            //rendering
            this.navigation.controls.update();
            this.renderer.renderer.render(this.scene, this.navigation.camera);
            this.renderer.labelRenderer.render(this.labelScene, this.navigation.camera);
            requestAnimationFrame(frame);
            //renderer.render(picker.pickingScene, camera);
        };

        this.updateSize();
        frame();
    }

    set timeMax(value: number) {
        this.timeMax_ = value;
    }

    get timeframe() {
        return [0, this.timeMax_];
    }

    set time(t: number) {
        this.time_ = t;
        this.scene.userData.time = t;
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