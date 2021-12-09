import { ILayerStyle } from "../types";
import { DecoderQueryType, Decoders } from "../utils/workers";


export class LayerStyle {
    styles: ILayerStyle;

    constructor(styles?: ILayerStyle, callback: (style: LayerStyle) => void = () => {}) {
        this.styles = styles || {};

        if (this.styles.buffer) {
            Decoders.Instance.process(
                [{
                    datatype: DecoderQueryType.uint8,
                    buffer: this.styles.buffer
                }], (buffer: Uint8Array) => {
                    this.styles.buffer = buffer;
                    callback(this);
                });
        }

        if (this.styles.buffer_source && this.styles.buffer_target) {
            Decoders.Instance.process(
                [{
                    datatype: DecoderQueryType.uint8,
                    buffer: this.styles.buffer_source
                }, {
                    datatype: DecoderQueryType.uint8,
                    buffer: this.styles.buffer_target
                }], (sbuffer: Uint8Array, tbuffer: Uint8Array) => {
                    this.styles.buffer_source = sbuffer;
                    this.styles.buffer_target = tbuffer;
                    callback(this);
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
    let c = {
        i: 0,
        ci: 0,
        it: 1,
        total_stop: oids.length / Uint32Array.BYTES_PER_ELEMENT,
        view: new DataView(oids.buffer)
    };


    const iteration = () => {
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
            setTimeout(iteration, 4);
        } else {
            callback();
            c = null as any;
        }

    }

    setTimeout(iteration, 4);
}

export function color_default(oid_length: number, outputbuffer: any, callback: CallableFunction) {    
    let c = {
        i: 0,
        ci: 0,
        it: 1,
        total_stop: oid_length
    };
    
    const iteration = () => {
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
            setTimeout(iteration, 4);
        } else {
            callback();
            c = null as any;
        }
    }

    setTimeout(iteration, 4);
}