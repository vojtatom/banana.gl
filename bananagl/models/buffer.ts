import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';

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

    applyMatrix(matrix: mat2 | mat3 | mat4, size: number) {
        if (matrix.length === 4 && size === 2) {
            this.applyMatrix2(matrix);
        } else if (matrix.length === 9 && size === 3) {
            this.applyMatrix3(matrix);
        } else if (matrix.length === 16 && (size === 4 || size === 3)) {
            this.applyMatrix4(matrix, size);
        } else {
            throw new Error(
                `Invalid combination of matrix (${matrix.length}) and element (${size}) size.`
            );
        }
    }

    private applyMatrix2(matrix: mat2) {
        for (let i = 0; i < this.data.length; i += 2) {
            vec2.transformMat2(
                this.data.subarray(i, i + 2) as vec2,
                this.data.subarray(i, i + 2) as vec2,
                matrix
            );
        }
    }

    private applyMatrix3(matrix: mat3) {
        for (let i = 0; i < this.data.length; i += 3) {
            vec3.transformMat3(
                this.data.subarray(i, i + 3) as vec3,
                this.data.subarray(i, i + 3) as vec3,
                matrix
            );
        }
    }

    private applyMatrix4(matrix: mat4, size: number) {
        for (let i = 0; i < this.data.length; i += size) {
            if (size === 3) {
                vec3.transformMat4(
                    this.data.subarray(i, i + 3) as vec3,
                    this.data.subarray(i, i + 3) as vec3,
                    matrix
                );
            } else if (size === 4) {
                vec4.transformMat4(
                    this.data.subarray(i, i + 4) as vec4,
                    this.data.subarray(i, i + 4) as vec4,
                    matrix
                );
            }
        }
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
