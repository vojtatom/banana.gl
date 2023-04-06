type BufferData =
    | Float32Array
    | Uint16Array
    | Uint32Array
    | Uint8Array
    | Int16Array
    | Int32Array
    | Int8Array;

export class Buffer {
    buffer: WebGLBuffer | null = null;
    constructor(public data: BufferData) {}

    protected setup(gl: WebGL2RenderingContext) {
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

    getDataType(gl: WebGL2RenderingContext) {
        if (this.data instanceof Float32Array) return gl.FLOAT;
        else if (this.data instanceof Uint16Array) return gl.UNSIGNED_SHORT;
        else if (this.data instanceof Uint32Array) return gl.UNSIGNED_INT;
        else if (this.data instanceof Uint8Array) return gl.UNSIGNED_BYTE;
        else if (this.data instanceof Int16Array) return gl.SHORT;
        else if (this.data instanceof Int32Array) return gl.INT;
        else if (this.data instanceof Int8Array) return gl.BYTE;
        else throw new Error('Unknown data type');
    }

    get BYTES_PER_ELEMENT() {
        return this.data.BYTES_PER_ELEMENT;
    }

    get bytesAllocated() {
        return this.data.length * this.data.BYTES_PER_ELEMENT;
    }
}

export class ElementBuffer extends Buffer {
    buffer: WebGLBuffer | null = null;
    constructor(public data: Uint16Array | Uint32Array) {
        super(data);
    }

    protected setup(gl: WebGL2RenderingContext) {
        const buffer = gl.createBuffer();
        if (!buffer) throw new Error('Failed to create buffer');
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        this.buffer = buffer;
    }

    bind(gl: WebGL2RenderingContext): asserts this is { buffer: WebGLBuffer } {
        if (!this.buffer) this.setup(gl);
        else gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    get BYTES_PER_ELEMENT() {
        return this.data.BYTES_PER_ELEMENT;
    }

    get bytesAllocated() {
        return this.data.length * this.data.BYTES_PER_ELEMENT;
    }
}
