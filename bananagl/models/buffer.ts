import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';

import { TypedArray } from '@bananagl/shaders/shader';

export function cloneTypedArrayWithSize(arr: TypedArray, size: number) {
    const newArr = new (arr.constructor as any)(size);
    return newArr;
}

interface ConstructableTypedArray {
    new (buffer: ArrayBuffer): TypedArray;
}

export class Buffer {
    buffer: WebGLBuffer | null = null;
    private partsToUpdate_: [number, number][] = [];
    constructor(public data: TypedArray) {}

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

    toUpdate(start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = this.data.length;
        this.partsToUpdate_.push([start, end]);
    }

    get needsUpdate() {
        return this.partsToUpdate_.length > 0;
    }

    get active() {
        return this.buffer !== null;
    }

    update(gl: WebGL2RenderingContext) {
        if (!this.buffer) throw new Error('Buffer not setup');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        for (const [start, end] of this.partsToUpdate_) {
            gl.bufferSubData(
                gl.ARRAY_BUFFER,
                start * this.data.BYTES_PER_ELEMENT,
                this.data.subarray(start, end)
            );
        }
        this.partsToUpdate_.length = 0;
    }

    getDataType(gl: WebGL2RenderingContext) {
        if (this.data instanceof Float32Array) return gl.FLOAT;
        else if (this.data instanceof Uint8Array) return gl.UNSIGNED_BYTE;
        else if (this.data instanceof Int16Array) return gl.SHORT;
        else if (this.data instanceof Int32Array) return gl.INT;
        else if (this.data instanceof Int8Array) return gl.BYTE;
        else throw new Error('Unsupported data type');
    }

    getView(typeConstructor: ConstructableTypedArray) {
        return new typeConstructor(this.data.buffer);
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

    swap(index1: number, index2: number, swapArr: TypedArray) {
        swapArr.set(this.data.subarray(index1, index1 + swapArr.length));
        this.data.set(this.data.subarray(index2, index2 + swapArr.length), index1);
        this.data.set(swapArr, index2);
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
