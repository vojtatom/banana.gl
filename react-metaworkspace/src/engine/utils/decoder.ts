
export class Decoder {
    static base64tofloat32(data: string, callback: CallableFunction) {
        let blob: string = window.atob(data);
        let len = blob.length / Float64Array.BYTES_PER_ELEMENT;
        let view: DataView = new DataView(new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT));
		let array = new Float32Array(len);
        let p = 0;
        let it = 1;
        const itStep = 10000;
        const totalStop = len * Float64Array.BYTES_PER_ELEMENT;
        
        const iteration = () => {
            const stepStop = it * itStep * Float64Array.BYTES_PER_ELEMENT;
            for (; p < Math.min(stepStop, totalStop); p = p + Float64Array.BYTES_PER_ELEMENT) {
                for(let i = 0; i < Float64Array.BYTES_PER_ELEMENT; ++i)
                    view.setUint8(i, blob.charCodeAt(p + i));
                array[p / Float64Array.BYTES_PER_ELEMENT] = view.getFloat64(0, true);
            }

            if (p < totalStop) {
                it++;
                setTimeout(iteration, 10);
            } else {
                view = null as unknown as DataView;
                blob = null as unknown as string;
                callback(array);
            }
        }

        iteration();
    }

    static base64toint32(data: string, offset: number = 0, callback: CallableFunction) {
        let blob: string = window.atob(data);
        let len = blob.length / Int32Array.BYTES_PER_ELEMENT;
        let view: DataView = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
		let array = new Uint32Array(len * Int32Array.BYTES_PER_ELEMENT);
        let p = 0;
        let it = 1;
        const itStep = 10000;
        const totalStop = len * Int32Array.BYTES_PER_ELEMENT;
        
        const iteration = () => {
            const stepStop = it * itStep * Int32Array.BYTES_PER_ELEMENT;
            
            for (; p < Math.min(stepStop, totalStop); p = p + Int32Array.BYTES_PER_ELEMENT) {
                for(let i = 0; i < Int32Array.BYTES_PER_ELEMENT; ++i)
                    view.setUint8(i, blob.charCodeAt(p + i));
                array[p / Int32Array.BYTES_PER_ELEMENT] = view.getUint32(0, true) + offset;
            }

            if (p < totalStop) {
                it++;
                setTimeout(iteration, 10);
            } else {
                view = null as unknown as DataView;
                blob = null as unknown as string;
                callback(new Uint8Array(array.buffer));
            }
        }

        iteration();
    }
}