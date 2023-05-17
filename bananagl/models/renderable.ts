import { mat4, vec3 } from 'gl-matrix';

import { Shader, UniformValue } from '@bananagl/shaders/shader';

import { Attributes } from './attributes';

export abstract class Renderable {
    private attributes_: Attributes = new Attributes();
    private position_: vec3 = [0, 0, 0];
    private rotation_: vec3 = [0, 0, 0];
    private scale_: vec3 = [1, 1, 1];
    private disposed_ = false;
    private visible_ = true;
    public mode: WebGLRenderingContextBase['TRIANGLES'] | WebGLRenderingContextBase['LINES'] = 4;


    private uniforms_: { [name: string]: UniformValue } = {
        uModelMatrix: mat4.identity(mat4.create()),
    };

    set uniforms(values: { [name: string]: UniformValue }) {
        for (const name in values) {
            const value = values[name];
            if (value === this.uniforms_[name]) continue;
            this.uniforms_[name] = value;
        }
    }

    get visible() {
        return this.visible_;
    }

    set visible(visible: boolean) {
        this.visible_ = visible;
    }

    get uniforms() {
        return this.uniforms_;
    }

    get attributes() {
        return this.attributes_;
    }

    get transform(): mat4 {
        return this.uniforms_.uModelMatrix as mat4;
    }

    dispose(gl: WebGL2RenderingContext) {
        this.disposed_ = true;
        this.attributes.dispose(gl);
    }

    get disposed() {
        return this.disposed_;
    }

    get position() {
        return this.position_;
    }

    set position(position: vec3) {
        this.position_ = position;
        this.updateMatrix();
    }

    get rotation() {
        return this.rotation_;
    }

    set rotation(rotation: vec3) {
        this.rotation_ = rotation;
        this.updateMatrix();
    }

    get scale() {
        return this.scale_;
    }

    set scale(scale: vec3) {
        this.scale_ = scale;
        this.updateMatrix();
    }

    translate(translation: vec3) {
        vec3.add(this.position, this.position, translation);
        this.updateMatrix();
    }

    private updateMatrix() {
        const transfomMatrix = this.transform;
        mat4.identity(transfomMatrix);
        mat4.translate(transfomMatrix, transfomMatrix, this.position);
        mat4.rotateX(transfomMatrix, transfomMatrix, (this.rotation[0] / 180) * Math.PI);
        mat4.rotateY(transfomMatrix, transfomMatrix, (this.rotation[1] / 180) * Math.PI);
        mat4.rotateZ(transfomMatrix, transfomMatrix, (this.rotation[2] / 180) * Math.PI);
        mat4.scale(transfomMatrix, transfomMatrix, this.scale);
    }

    abstract get shader(): Shader;
}
