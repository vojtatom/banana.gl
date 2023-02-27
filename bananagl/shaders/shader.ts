import { handleErrors } from './errors';

const PRE = `#version 300 es
precision highp float;
precision highp int;
`;

export type UniformValue =
    | number
    | number[]
    | boolean
    | boolean[]
    | Float32Array
    | Int32Array
    | Int16Array
    | Int8Array
    | Uint32Array
    | Uint16Array
    | Uint8Array
    | null;

function iterEqual(a: any, b: any) {
    if (!a.length || !b.length) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export class Shader {
    private gl_?: WebGL2RenderingContext;
    private program_?: WebGLProgram;
    private attributes_: { [name: string]: number } = {};
    private uniforms_: {
        [name: string]: {
            loc: WebGLUniformLocation;
            value: UniformValue;
        };
    } = {};
    active: boolean = false;

    constructor(private vertexShader: string, private fragmentShader: string) {}

    setup(gl: WebGL2RenderingContext) {
        this.gl_ = gl;
        this.program_ = this.compile();
        this.getUniforms();
        this.getAttributes();
        this.active = true;
    }

    private compile() {
        const gl = this.gl;

        const vs = gl.createShader(gl.VERTEX_SHADER);
        if (!vs) throw new Error('Failed to create vertex shader');
        const vsCode = PRE + this.vertexShader;
        gl.shaderSource(vs, vsCode);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fs) throw new Error('Failed to create fragment shader');
        const fsCode = PRE + this.fragmentShader;
        gl.shaderSource(fs, fsCode);
        gl.compileShader(fs);

        const program = gl.createProgram();
        if (!program) throw new Error('Failed to create program');
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!handleErrors(this.gl, program, vs, fs)) this.active = true;

        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return program;
    }

    private getUniforms() {
        const program = this.program;
        const gl = this.gl;

        const uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniforms; i++) {
            const uniform = gl.getActiveUniform(program, i);
            if (!uniform) throw new Error(`Failed to get uniform at index ${i}`);
            const location = gl.getUniformLocation(program, uniform.name);
            if (!location) throw new Error(`Failed to get uniform location for ${uniform.name}`);
            this.uniforms_[uniform.name] = {
                loc: location,
                value: null,
            };
        }
    }

    private getAttributes() {
        const program = this.program;
        const gl = this.gl;

        const attributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attributes; i++) {
            const attribute = gl.getActiveAttrib(program, i);
            if (!attribute) throw new Error(`Failed to get attribute at index ${i}`);
            const location = gl.getAttribLocation(program, attribute.name);
            if (location < 0)
                throw new Error(`Failed to get attribute location for ${attribute.name}`);
            this.attributes_[attribute.name] = location;
        }
    }

    get uniforms() {
        const uValues: { [name: string]: UniformValue } = {};
        for (const name in this.uniforms_) {
            uValues[name] = this.uniforms_[name].value;
        }

        return uValues;
    }

    set uniforms(values: { [name: string]: UniformValue }) {
        const gl = this.gl;
        const program = this.program;

        for (const name in values) {
            const uniform = this.uniforms_[name];
            if (!uniform) throw new Error(`No uniform with name ${name}`);

            const value = values[name];
            if (value === uniform.value || iterEqual(value, uniform.value)) continue;

            const loc = uniform.loc;
            this.setValue(value, gl, loc);
            uniform.value = value;
        }
    }

    private setValue(value: UniformValue, gl: WebGL2RenderingContext, loc: WebGLUniformLocation) {
        if (value === null) {
            gl.uniform1i(loc, 0);
        } else if (typeof value === 'number') {
            gl.uniform1f(loc, value);
        } else if (typeof value === 'boolean') {
            gl.uniform1i(loc, value ? 1 : 0);
        } else if (value instanceof Float32Array || value instanceof Float64Array) {
            if (value.length === 2) {
                gl.uniform2fv(loc, value);
            } else if (value.length === 3) {
                gl.uniform3fv(loc, value);
            } else if (value.length === 4) {
                gl.uniform4fv(loc, value);
            } else {
                throw new Error(`Invalid uniform array length ${value.length}`);
            }
        } else if (
            value instanceof Uint32Array ||
            value instanceof Uint16Array ||
            value instanceof Uint8Array
        ) {
            if (value.length === 2) {
                gl.uniform2uiv(loc, value);
            } else if (value.length === 3) {
                gl.uniform3uiv(loc, value);
            } else if (value.length === 4) {
                gl.uniform4uiv(loc, value);
            } else {
                throw new Error(`Invalid uniform array length ${value.length}`);
            }
        } else if (
            value instanceof Int32Array ||
            value instanceof Int16Array ||
            value instanceof Int8Array
        ) {
            if (value.length === 2) {
                gl.uniform2iv(loc, value);
            } else if (value.length === 3) {
                gl.uniform3iv(loc, value);
            } else if (value.length === 4) {
                gl.uniform4iv(loc, value);
            } else {
                throw new Error(`Invalid uniform array length ${value.length}`);
            }
        } else if (Array.isArray(value)) {
            if (typeof value[0] === 'number') {
                if (value.length === 2) {
                    gl.uniform2fv(loc, value as number[]);
                } else if (value.length === 3) {
                    gl.uniform3fv(loc, value as number[]);
                } else if (value.length === 4) {
                    gl.uniform4fv(loc, value as number[]);
                } else {
                    throw new Error(`Invalid uniform array length ${value.length}`);
                }
            } else if (typeof value[0] === 'boolean') {
                if (value.length === 2) {
                    gl.uniform2iv(loc, value as number[]);
                } else if (value.length === 3) {
                    gl.uniform3iv(loc, value as number[]);
                } else if (value.length === 4) {
                    gl.uniform4iv(loc, value as number[]);
                } else {
                    throw new Error(`Invalid uniform array length ${value.length}`);
                }
            } else {
                throw new Error(`Invalid uniform array type ${typeof value[0]}`);
            }
        } else {
            throw new Error(`Invalid uniform type ${typeof value}`);
        }
    }

    get attributes() {
        return this.attributes_;
    }

    private get program() {
        if (!this.program_) throw new Error('No program');
        return this.program_;
    }

    private get gl() {
        if (!this.gl_) throw new Error('No WebGL context');
        return this.gl_;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    dispose() {
        this.gl.deleteProgram(this.program);
    }
}
