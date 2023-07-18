import { FrameBuffer } from './framebuffer';
import { ScreenPass } from './screenPass';

export class PostProcessing {
    public enabled = false;
    private framebuffer?: FrameBuffer;
    private passes: ScreenPass[] = [];

    bind(gl: WebGL2RenderingContext, size: [number, number]) {
        if (!this.enabled) return;
        if (!this.framebuffer) this.framebuffer = new FrameBuffer(gl, size[0], size[1]);
        else this.framebuffer.update(gl, size[0], size[1]);
        this.framebuffer.bind(gl);
    }

    unbind(gl: WebGL2RenderingContext) {
        if (!this.enabled) return;
        if (!this.framebuffer) throw new Error('Framebuffer not initialized');
        this.framebuffer.unbind(gl);
    }

    //currently will only work with a single pass
    addPass(pass: ScreenPass) {
        this.passes.push(pass);
    }

    runPasses(gl: WebGL2RenderingContext) {
        if (!this.enabled) return;
        if (!this.framebuffer) throw new Error('Framebuffer not initialized');

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        for (const pass of this.passes) {
            if (!pass.shader.active) pass.shader.setup(gl);
            pass.bindTextures(this.framebuffer.colorTexture, this.framebuffer.depthTexture);
            pass.shader.use();
            pass.attributes.bind(gl, pass.shader);
            pass.shader.uniforms = pass.uniforms;
            gl.drawArrays(pass.mode, 0, pass.attributes.count);
        }
    }
}
