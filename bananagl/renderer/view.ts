import { Scene } from '@bananagl/scene/scene';
import { viewRenderPass } from './pass';
import { Renderer } from './renderer';

export class View {
    private x: number = 0;
    private y: number = 0;
    private width: number = 0;
    private height: number = 0;
    constructor(readonly scene: Scene) {}

    resize(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(renderer: Renderer) {
        const gl = renderer.gl;
        gl.viewport(this.x, this.y, this.width, this.height);
        gl.scissor(this.x, this.y, this.width, this.height);
        viewRenderPass(this.scene, renderer);
    }
}
