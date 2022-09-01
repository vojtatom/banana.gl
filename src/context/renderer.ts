import * as THREE from "three";
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';


export interface RendererProps {
    canvas: HTMLCanvasElement;
    background: number;
}


export class Renderer {
    readonly renderer: THREE.WebGLRenderer;
    readonly labelRenderer: CSS2DRenderer = new CSS2DRenderer();

    constructor(props: RendererProps, container: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: props.canvas,
            antialias: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setClearColor(props.background!, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        container.prepend(this.labelRenderer.domElement);
    }

    resize(width: number, height: number) {
        this.renderer.setSize(width, height);
        this.labelRenderer.setSize(width, height);
    }
}

