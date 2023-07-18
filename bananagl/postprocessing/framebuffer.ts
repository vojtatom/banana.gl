import { ColorTexture, DepthTexture } from './texture';

export class FrameBuffer {
    private textureColor: ColorTexture;
    private textureDepth: DepthTexture;
    readonly framebuffer: WebGLFramebuffer;

    constructor(gl: WebGL2RenderingContext, width: number, height: number) {
        this.textureColor = new ColorTexture(gl, width, height);
        this.textureDepth = new DepthTexture(gl, width, height);
        const framebuffer = gl.createFramebuffer();
        if (!framebuffer) throw new Error('Failed to create framebuffer');
        this.framebuffer = framebuffer;
        this.bindAndSet(gl);
    }

    update(gl: WebGL2RenderingContext, width: number, height: number) {
        if (!this.textureColor) throw new Error('Framebuffer disposed');
        if (!this.textureDepth) throw new Error('Framebuffer disposed');
        if (this.textureColor.size[0] === width && this.textureColor.size[1] === height) return;
        this.textureColor.dispose(gl);
        this.textureDepth.dispose(gl);
        this.textureColor = new ColorTexture(gl, width, height);
        this.textureDepth = new DepthTexture(gl, width, height);
        this.bindAndSet(gl);
    }

    private bindAndSet(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.textureColor.texture,
            0
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.textureDepth.texture,
            0
        );
        console.log('Framebuffer initialized');
    }

    bind(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    unbind(gl: WebGL2RenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    check(gl: WebGL2RenderingContext) {
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer is incomplete');
        }
    }

    get colorTexture() {
        return this.textureColor.texture;
    }

    get depthTexture() {
        return this.textureDepth.texture;
    }
}
