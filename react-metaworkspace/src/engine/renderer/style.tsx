import { ILayerStyle } from "../types";
import { Decoder } from "../utils/decoder";


export class LayerStyle {
    styles: ILayerStyle;

    constructor(styles?: ILayerStyle, callback: (style: LayerStyle) => void = () => {}) {
        this.styles = styles || {};

        if (this.styles.buffer) {
            Decoder.base64touint8(this.styles.buffer as string, (buffer: Uint8Array) => {
                this.styles.buffer = buffer;
                callback(this);
            });
        }

        if (this.styles.buffer_source && this.styles.buffer_target) {
            Decoder.base64touint8(this.styles.buffer_source as string, (buffer: Uint8Array) => {
                this.styles.buffer_source = buffer;
                Decoder.base64touint8(this.styles.buffer_target as string, (buffer: Uint8Array) => {
                    this.styles.buffer_target = buffer;
                    callback(this);
                });
            });
        }
    }

    get pickable() {
        if (this.styles.pickable) {
            return this.styles.pickable;
        }
        return true;
    }

    get visible() {
        if (this.styles.visible) {
            return this.styles.visible;
        }
        return true;
    }

    get color_buffer() {
        if (this.styles.buffer)
            return this.styles.buffer as Uint8Array;
        throw new Error("No colors defined");
    }

    get color_buffer_target() {
        if (this.styles.buffer_target) 
            return this.styles.buffer_target as Uint8Array;
        throw new Error("No target colors defined");
    }

    get color_buffer_source() {
        if (this.styles.buffer_source) 
            return this.styles.buffer_source as Uint8Array;
        throw new Error("No source colors defined");
    }
}




export function color(oid_offset: number, oids: Uint8Array, buffer: Uint8Array, outputbuffer: any, callback: CallableFunction) {

    const iteration = (c: {i: number, ci: number, it: number, total_stop: number, view: DataView}) => {
        const itStep = 100000;
        const step_stop = c.it * itStep;
        const stop = Math.min(step_stop, c.total_stop);

        let oid;
        for (; c.i < stop; c.i++) {
            oid = (c.view.getUint32(c.i * Uint32Array.BYTES_PER_ELEMENT, true) - oid_offset) * 3;
            outputbuffer[c.ci++] = buffer[oid];
            outputbuffer[c.ci++] = buffer[oid + 1];
            outputbuffer[c.ci++] = buffer[oid + 2];
        }

        if (c.i < c.total_stop) {
            c.it++;
            Promise.resolve(c).then(iteration);
        } else {
            callback();
        }

        c = null as any;
    }

    Promise.resolve({
        i: 0,
        ci: 0,
        it: 1,
        total_stop: oids.length / Uint32Array.BYTES_PER_ELEMENT,
        view: new DataView(oids.buffer)
    }).then(iteration);
}

export function color_default(oid_length: number, outputbuffer: any, callback: CallableFunction) {    
    const iteration = (c: {i: number, ci: number, it: number, total_stop: number}) => {
        const itStep = 100000;
        const step_stop = c.it * itStep * Uint8Array.BYTES_PER_ELEMENT;
        const stop = Math.min(step_stop, c.total_stop);

        for (; c.i < stop; c.i++) {
            outputbuffer[c.ci++] = 255;
            outputbuffer[c.ci++] = 255;
            outputbuffer[c.ci++] = 255;
        }

        if (c.i < c.total_stop) {
            c.it++;
            Promise.resolve(c).then(iteration);
        } else {
            callback();
        }
        c = null as any;
    }

    Promise.resolve({
        i: 0,
        ci: 0,
        it: 1,
        total_stop: oid_length
    }).then(iteration);
}