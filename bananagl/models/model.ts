import { Shader } from '../shaders/shader';
import { Renderable } from './renderable';

export class Model extends Renderable {
    protected _shader?: Shader;
    protected data_: { [name: string]: any } = {};

    get shader() {
        if (!this._shader) {
            throw new Error('Shader not set');
        }

        return this._shader;
    }

    set shader(shader: Shader) {
        this._shader = shader;
    }

    set data(data: { [name: string]: any }) {
        for (const name in data) {
            const value = data[name];
            if (value === this.data_[name]) continue;
            this.data_[name] = value;
        }
    }

    get data() {
        return this.data_;
    }
}
