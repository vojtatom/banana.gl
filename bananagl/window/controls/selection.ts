import { vec2 } from 'gl-matrix';

import { Attribute } from '@bananagl/models/attribute';
import { Buffer } from '@bananagl/models/buffer';
import { Model } from '@bananagl/models/model';
import { Shader } from '@bananagl/shaders/shader';

import { View } from '../view';

const vs = `
uniform vec2 u_from;
uniform vec2 u_to;

in vec2 position;

void main() {
    vec2 p = mix(u_from, u_to, position);
    gl_Position = vec4(p, 0, 1);
}
`;

const fs = `

out vec4 color;

void main() {
    color = vec4(0.98, 0.82, 0.30, 0.3);
}
`;

const program = new Shader(vs, fs, true);

export class RangeSelection {
    public toX: number = 0;
    public toY: number = 0;
    private selectionRectangle: Model;
    private inScene: boolean = false;

    constructor(public x: number, public y: number) {
        const positions = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
        const model = new Model();
        model.attributes.add(new Attribute('position', new Buffer(positions), 2));
        model.shader = program;
        this.selectionRectangle = model;
    }

    updateSelection(view: View, x: number, y: number) {
        if (!this.inScene) view.scene.add(this.selectionRectangle, true), (this.inScene = true);
        this.selectionRectangle.uniforms = {
            u_from: view.toNDC(this.x, this.y),
            u_to: view.toNDC(x, y),
        };
        this.toX = x;
        this.toY = y;
    }

    dispose(view: View) {
        view.scene.remove(this.selectionRectangle, true);
    }

    get from() {
        return [this.x, this.y] as vec2;
    }

    get to() {
        return [this.toX, this.toY] as vec2;
    }
}
