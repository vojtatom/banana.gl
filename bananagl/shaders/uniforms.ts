import { Shader } from './shader';

type Uniform = number | number[] | Float32Array | Int32Array | Uint32Array | WebGLTexture;

export class UniformGroup {
    constructor(
        private gl: WebGL2RenderingContext,
        public uniforms: { [name: string]: Uniform },
        public shader: Shader,
        public uniformLocations: { [name: string]: WebGLUniformLocation }
    ) {}

    setUniforms() {
        const { uniforms, shader, uniformLocations } = this;
        shader.use();

        for (const name in uniforms) {
            const uniform = uniforms[name];
            const location = uniformLocations[name];
            if (uniform instanceof WebGLTexture) {
                this.gl.uniform1i(location, 0);
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, uniform);
            } else if (uniform instanceof Float32Array) {
                this.gl.uniformMatrix4fv(location, false, uniform);
            } else if (uniform instanceof Int32Array) {
                this.gl.uniform1iv(location, uniform);
            } else if (uniform instanceof Uint32Array) {
                this.gl.uniform1uiv(location, uniform);
            } else if (uniform instanceof Array) {
                this.gl.uniform3fv(location, uniform);
            } else if (typeof uniform === 'number') {
                this.gl.uniform1f(location, uniform);
            } else {
                throw new Error(`Unknown uniform type: ${uniform}`);
            }
        }
    }
}
