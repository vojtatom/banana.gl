
export class Decoder {
    static base64tofloat32(data: string,  abort: CallableFunction, callback: CallableFunction) {        
        const iteration = (c: {p: number, it: number, view: DataView, blob: string, totalStop: number, array: Float32Array}) => {
            const itStep = 100000;
            const stepStop = c.it * itStep * Float64Array.BYTES_PER_ELEMENT;
            const stop = Math.min(stepStop, c.totalStop);

            for (; c.p < stop; c.p += Float64Array.BYTES_PER_ELEMENT) {
                for(let i = 0; i < Float64Array.BYTES_PER_ELEMENT; ++i)
                    c.view.setUint8(i, c.blob.charCodeAt(c.p + i));
                c.array[c.p / Float64Array.BYTES_PER_ELEMENT] = c.view.getFloat64(0, true);
            }

            if (abort())
                return;

            if (c.p < c.totalStop) {
                c.it++;
                Promise.resolve(c).then(iteration);
            } else {
                callback(c.array);
            }

            c = null as any;
        }

        let conf: any = {
            p: 0,
            it: 1,
            view: new DataView(new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT)),
            blob: window.atob(data)
        };

        const len = conf.blob.length / Float64Array.BYTES_PER_ELEMENT;
        conf['array'] = new Float32Array(len);
        conf['totalStop'] = len * Float64Array.BYTES_PER_ELEMENT;
        
        Promise.resolve(conf).then(iteration);
        conf = null;
    }

    static base64toint32(data: string, offset: number = 0, abort: CallableFunction, callback: CallableFunction) {        
        const iteration = (c: {p: number, it: number, view: DataView, blob: string, totalStop: number, array: Uint32Array}) => {
            const itStep = 100000;
            const stepStop = c.it * itStep * Int32Array.BYTES_PER_ELEMENT;
            const stop = Math.min(stepStop, c.totalStop);

            for (; c.p < stop; c.p += Int32Array.BYTES_PER_ELEMENT) {
                for(let i = 0; i < Int32Array.BYTES_PER_ELEMENT; ++i)
                    c.view.setUint8(i, c.blob.charCodeAt(c.p + i));
                c.array[c.p / Int32Array.BYTES_PER_ELEMENT] = c.view.getInt32(0, true) + offset;
            }

            if (abort())
                return;

            if (c.p < c.totalStop) {
                c.it++;
                Promise.resolve(c).then(iteration);
            } else {
                callback(new Uint8Array(c.array.buffer));
            }

            c = null as any;
        }

        let conf: any = {
            p: 0,
            it: 1,
            view: new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT)),
            blob: window.atob(data)
        };

        const len = conf.blob.length / Int32Array.BYTES_PER_ELEMENT;
        conf['array'] = new Int32Array(len);
        conf['totalStop'] = len * Int32Array.BYTES_PER_ELEMENT;
        Promise.resolve(conf).then(iteration);
        conf = null;
    }

    static base64touint8(data: string, callback: CallableFunction) {
        const iteration = (c: {p: number, it: number, blob: string, totalStop: number, array: Uint32Array}) => {
            const itStep = 1000000;
            const stepStop = c.it * itStep * Uint8Array.BYTES_PER_ELEMENT;
            const stop = Math.min(stepStop, c.totalStop);
            
            for (; c.p < stop; c.p += Uint8Array.BYTES_PER_ELEMENT) {
                c.array[c.p] = c.blob.charCodeAt(c.p)
            }

            if (c.p < c.totalStop) {
                c.it++;
                Promise.resolve(c).then(iteration);
            } else {
                callback(c.array);
            }

            c = null as any;
        }

        let conf: any = {
            p: 0,
            it: 1,
            blob: window.atob(data)
        };

        const len = conf.blob.length / Uint8Array.BYTES_PER_ELEMENT;
        conf['array'] = new Uint8Array(len);
        conf['totalStop'] = len;
        Promise.resolve(conf).then(iteration);
        conf = null;
    }
}