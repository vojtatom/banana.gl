export class Renderer {
    private isInitialized = false;
    private context?: WebGL2RenderingContext;

    constructor(canvas?: HTMLCanvasElement) {
        if (canvas) this.init(canvas);
    }

    init(canvas: HTMLCanvasElement, options?: WebGLContextAttributes) {
        if (this.isInitialized) return;
        this.isInitialized = true;
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
    }

    get gl() {
        if (!this.context) throw new Error('Renderer not initialized');
        return this.context;
    }
}
