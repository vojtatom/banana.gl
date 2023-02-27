import { Shader } from '@bananagl/shaders/shader';

type BufferData =
    | Float32Array
    | Uint16Array
    | Uint32Array
    | Uint8Array
    | Int16Array
    | Int32Array
    | Int8Array;

class Buffer {
    buffer: WebGLBuffer | null = null;
    constructor(public data: BufferData) {}

    private setup(gl: WebGL2RenderingContext) {
        const buffer = gl.createBuffer();
        if (!buffer) throw new Error('Failed to create buffer');
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        this.buffer = buffer;
    }

    bind(gl: WebGL2RenderingContext): asserts this is { buffer: WebGLBuffer } {
        if (!this.buffer) this.setup(gl);
        else gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    }
}

class Attribute {
    protected active = false;

    constructor(
        public name: string,
        public buffer: Buffer,
        public size: number,
        public type: number,
        public normalized: boolean,
        public stride: number,
        public offset: number
    ) {}

    protected setup(gl: WebGL2RenderingContext, location: number) {
        this.buffer.bind(gl);
        gl.vertexAttribPointer(
            location,
            this.size,
            this.type,
            this.normalized,
            this.stride,
            this.offset
        );
    }

    get count() {
        return 0; //TODO
    }

    bind(gl: WebGL2RenderingContext, location: number) {
        if (!this.active) this.setup(gl, location), (this.active = true);
        this.buffer.bind(gl);
    }
}

class InstancedAttribute extends Attribute {
    private divisor: number;

    constructor(
        name: string,
        buffer: Buffer,
        size: number,
        type: number,
        normalized: boolean,
        stride: number,
        offset: number,
        divisor: number
    ) {
        super(name, buffer, size, type, normalized, stride, offset);
        this.divisor = divisor;
    }

    protected setup(gl: WebGL2RenderingContext, location: number) {
        super.setup(gl, location);
        gl.vertexAttribDivisor(location, this.divisor);
    }

    bind(gl: WebGL2RenderingContext, location: number) {
        if (!this.active) this.setup(gl, location), (this.active = true);
        super.bind(gl, location);
    }
}

export class Attributes {
    private vao?: WebGLVertexArrayObject;
    private attributes: (Attribute | InstancedAttribute)[] = [];

    constructor() {}

    add(attribute: Attribute | InstancedAttribute) {
        this.attributes.push(attribute);
    }

    private setup(gl: WebGL2RenderingContext, shader: Shader) {
        const vao = gl.createVertexArray();
        if (!vao) throw new Error('Failed to create vertex array object');
        gl.bindVertexArray(vao);

        for (const attribute of this.attributes) {
            const location = shader.attributes[attribute.name];
            if (location === undefined || location === -1) continue;
            attribute.bind(gl, location);
        }

        gl.bindVertexArray(null);
        this.vao = vao;
    }

    get count() {
        return this.attributes[0].count;
    }

    bind(gl: WebGL2RenderingContext, shader: Shader) {
        if (!this.vao) this.setup(gl, shader);
        else gl.bindVertexArray(this.vao);
    }
}
