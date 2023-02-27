import { Shader, UniformValue } from '@bananagl/shaders/shader';
import { Attributes } from './attributes';

export abstract class Renderable {
    private uniforms_: { [name: string]: UniformValue } = {};
    private attributes_: Attributes = new Attributes();

    set uniforms(values: { [name: string]: UniformValue }) {
        for (const name in values) {
            const value = values[name];
            if (value === this.uniforms_[name]) continue;
            this.uniforms_[name] = value;
        }
    }

    get uniforms() {
        return this.uniforms_;
    }

    get attributes() {
        return this.attributes_;
    }

    abstract get shader(): Shader;
}
