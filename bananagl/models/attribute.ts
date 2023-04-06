import { Buffer, ElementBuffer } from './buffer';

export class Attribute {
    protected active = false;
    public type?: number;

    constructor(
        public name: string,
        public buffer: Buffer,
        public size: number,
        public normalized: boolean = false,
        public stride: number = 0,
        public offset: number = 0
    ) {}

    protected setup(gl: WebGL2RenderingContext, location: number) {
        if (location === undefined || location === -1) return;

        this.buffer.bind(gl);
        this.type = this.buffer.getDataType(gl);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(
            location,
            this.size,
            this.type,
            this.normalized,
            this.stride * this.buffer.BYTES_PER_ELEMENT,
            this.offset * this.buffer.BYTES_PER_ELEMENT
        );
        this.active = true;
    }

    get count() {
        return this.buffer.data.length;
    }

    bind(gl: WebGL2RenderingContext, location: number) {
        if (!this.active) this.setup(gl, location);
        else this.buffer.bind(gl);
    }
}

export class ElementAttribute extends Attribute {
    constructor(name: string, buffer: ElementBuffer, size: number) {
        super(name, buffer, size, false, 0, 0);
    }

    protected setup(gl: WebGL2RenderingContext, _: number) {
        this.buffer.bind(gl);
        this.type = this.buffer.getDataType(gl);
        this.active = true;
    }

    bind(gl: WebGL2RenderingContext, location: number) {
        if (!this.active) this.setup(gl, location);
        else this.buffer.bind(gl);
    }
}

export class InstancedAttribute extends Attribute {
    private divisor: number;

    constructor(
        name: string,
        buffer: Buffer,
        size: number,
        normalized: boolean,
        stride: number,
        offset: number,
        divisor: number
    ) {
        super(name, buffer, size, normalized, stride, offset);
        this.divisor = divisor;
    }

    protected setup(gl: WebGL2RenderingContext, location: number) {
        if (location === undefined || location === -1) return;

        super.setup(gl, location);
        gl.vertexAttribDivisor(location, this.divisor);
    }

    bind(gl: WebGL2RenderingContext, location: number) {
        if (!this.active) this.setup(gl, location);
        super.bind(gl, location);
    }
}