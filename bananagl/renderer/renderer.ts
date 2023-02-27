import { Window } from './window';

export class Renderer {
    private context?: WebGL2RenderingContext;
    private window_?: Window;

    constructor(canvas?: HTMLCanvasElement, options?: WebGLContextAttributes) {
        if (canvas) this.init(canvas, options);
    }

    init(canvas: HTMLCanvasElement, options?: WebGLContextAttributes) {
        if (!this.context || !this.window_) return;
        console.log('Renderer initialized');

        //init with highest performance settings
        const context = canvas.getContext('webgl2', {
            antialias: options?.antialias ?? false,
            alpha: options?.alpha ?? false,
            depth: options?.depth ?? true,
            stencil: options?.stencil ?? false,
            powerPreference: options?.powerPreference ?? 'high-performance',
            premultipliedAlpha: options?.premultipliedAlpha ?? false,
            preserveDrawingBuffer: options?.preserveDrawingBuffer ?? false,
            failIfMajorPerformanceCaveat: options?.failIfMajorPerformanceCaveat ?? false,
        });

        if (!context) throw new Error('WebGL2 not supported');
        this.context = context;
        this.window_ = new Window(canvas);
    }

    get gl() {
        if (!this.context) throw new Error('Renderer not initialized');
        return this.context;
    }

    get views() {
        if (!this.window_) throw new Error('Renderer not initialized');
        return this.window_;
    }

    render() {
        this.views.render(this);
    }
}
