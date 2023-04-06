import { Camera } from '@bananagl/scene/camera';
import { Scene } from '@bananagl/scene/scene';

import { viewRenderPass } from './pass';
import { Renderer } from './renderer';
import { vec3 } from 'gl-matrix';

export class View {
    x: number = 0;
    y: number = 0;
    private width_: number = 0;
    private height_: number = 0;
    private randomColor: vec3;
    readonly camera: Camera = new Camera();

    constructor(readonly scene: Scene) {
        this.randomColor = [Math.random(), Math.random(), Math.random()];
    }

    resize(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width_ = width;
        this.height_ = height;
        this.camera.updateAspectRatio(width, height);
    }

    render(renderer: Renderer) {
        const gl = renderer.gl;
        gl.clearColor(this.randomColor[0], this.randomColor[1], this.randomColor[2], 1);
        gl.viewport(this.x, this.y, this.width, this.height);
        gl.scissor(this.x, this.y, this.width, this.height);
        viewRenderPass(this.scene, renderer, this.camera);
    }

    renderLayout(renderer: Renderer) {
        const gl = renderer.gl;
        gl.clearColor(this.randomColor[0], this.randomColor[1], this.randomColor[2], 1);
        gl.viewport(this.x, this.y, this.width, this.height);
        gl.scissor(this.x, this.y, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    //all coords from bottom left
    toLocal(x: number, y: number) {
        return [x - this.x, y - this.y];
    }

    get width() {
        return this.width_;
    }

    get height() {
        return this.height_;
    }
}