import { Shader } from '../shaders/shader';
import { Renderable } from './renderable';

export class Model extends Renderable {
    private _shader?: Shader;

    get shader() {
        if (!this._shader) {
            throw new Error('Shader not set');
        }

        return this._shader;
    }

    set shader(shader: Shader) {
        this._shader = shader;
    }
}
