import { handleErrors } from './errors';

const PRE = `#version 300 es
precision highp float;
precision highp int;
`;

export class Shader {
    private gl_?: WebGL2RenderingContext;
    private program_?: WebGLProgram;
    private attributes_: { [name: string]: number } = {};
    private uniforms_: { [name: string]: WebGLUniformLocation } = {};
    private active: boolean = false;

    constructor(private vertexShader: string, private fragmentShader: string) {}

    setup(gl: WebGL2RenderingContext) {
        this.gl_ = gl;
        this.program_ = this.compile();
        this.getUniforms();
        this.getAttributes();
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
            this.uniforms_[uniform.name] = location;
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
        return this.uniforms_;
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
