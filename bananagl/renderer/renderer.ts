import { Window } from './window';

export class Renderer {
    private context?: WebGL2RenderingContext;
    private window_?: Window;

    constructor(canvas?: HTMLCanvasElement, options?: WebGLContextAttributes) {
        if (canvas) this.init(canvas, options);
    }

    init(canvas: HTMLCanvasElement, options?: WebGLContextAttributes) {
        if (this.context || this.window_) return;
        console.log('Renderer initialized');

        //init with highest performance settings
        const gl = canvas.getContext('webgl2', {
            antialias: options?.antialias ?? true,
            alpha: options?.alpha ?? false,
            depth: options?.depth ?? true,
            stencil: options?.stencil ?? false,
            powerPreference: options?.powerPreference ?? 'high-performance',
            premultipliedAlpha: options?.premultipliedAlpha ?? false,
            preserveDrawingBuffer: options?.preserveDrawingBuffer ?? false,
            failIfMajorPerformanceCaveat: options?.failIfMajorPerformanceCaveat ?? false,
        });

        if (!gl) throw new Error('WebGL2 not supported');
        this.context = gl;
        this.window_ = new Window(canvas);

        gl.enable(gl.SCISSOR_TEST);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
    }

    get gl() {
        if (!this.context) throw new Error('Renderer not initialized');
        return this.context;
    }

    get views() {
        if (!this.window_) throw new Error('Renderer not initialized');
        return this.window_.views;
    }

    get window() {
        if (!this.window_) throw new Error('Renderer not initialized');
        return this.window_;
    }

    render() {
        this.window.render(this);
    }

    renderLayout() {
        this.window.renderLayout(this);
    }

    destroy() {
        this.context = undefined;
        this.window_ = undefined;
    }

    animationLoop() {
        this.render();
        requestAnimationFrame(() => this.animationLoop());
    }
}
