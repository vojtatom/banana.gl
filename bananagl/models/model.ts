import { Shader } from '../shaders/shader';
import { Renderable } from './renderable';

export class Model extends Renderable {
    protected _shader?: Shader;
    protected data_: { [name: string]: any } = {};

    constructor() {
        super();
    }

    get shader() {
        if (!this._shader) {
            throw new Error('Shader not set');
        }

        return this._shader;
    }

    get data() {
        return this.data_;
    }

    set data(data: { [name: string]: any }) {
        this.data_ = data;
    }

    set shader(shader: Shader) {
        this._shader = shader;
    }
}
