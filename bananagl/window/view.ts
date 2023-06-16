import { vec2, vec3 } from 'gl-matrix';

import { Camera } from '@bananagl/camera/camera';
import { CameraLock } from '@bananagl/camera/cameraLock';
import { Scene } from '@bananagl/scene/scene';

import { viewRenderPass } from '../renderer/pass';
import { Renderer } from '../renderer/renderer';

export class View {
    x: number = 0;
    y: number = 0;
    private width_: number = 0;
    private height_: number = 0;
    private randomColor: vec3;
    readonly camera: Camera = new Camera();
    readonly cameraLock = new CameraLock(this.camera);

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
        gl.viewport(this.x, this.y, this.width, this.height);
        gl.scissor(this.x, this.y, this.width, this.height);
        viewRenderPass(this.scene, renderer, this.camera);
    }

    toLocal(x: number, y: number): vec2 {
        return [x - this.x, y - this.y];
    }

    get width() {
        return this.width_;
    }

    get height() {
        return this.height_;
    }

    toNDC(x: number, y: number): vec2 {
        const invDpr = 1 / window.devicePixelRatio;
        return [
            ((x - this.x * invDpr) / (this.width_ * invDpr)) * 2 - 1,
            -((y - this.y * invDpr) / (this.height_ * invDpr)) * 2 + 1,
        ];
    }
}
