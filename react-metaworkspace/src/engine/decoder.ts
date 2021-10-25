

export class Decoder {
    static base64tofloat32(data: string, callback: CallableFunction) {
        let blob: string = window.atob(data);
        let len = blob.length / Float64Array.BYTES_PER_ELEMENT;
        let view: DataView = new DataView(new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT));
		let array = new Float32Array(len);
        let p = 0;
        let it = 1;
        const itStep = 10000;
        
        const iteration = () => {
            const stepStop = it * itStep * Float64Array.BYTES_PER_ELEMENT;
            const totalStop = len * Float64Array.BYTES_PER_ELEMENT;
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
    
    static base64toint32(data: string) {
        let blob:  string|null = window.atob(data);
        let array;
        let len = blob.length / Int32Array.BYTES_PER_ELEMENT;
        let view: DataView|null = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
        array = new Int32Array(len);
        
        for (let p = 0; p < len * Int32Array.BYTES_PER_ELEMENT; p = p + Int32Array.BYTES_PER_ELEMENT) {
            for(let i = 0; i < Float64Array.BYTES_PER_ELEMENT; ++i)
                view.setUint8(i, blob.charCodeAt(p + i));
            array[p / Int32Array.BYTES_PER_ELEMENT] = view.getInt32(0, true);
        }
        view = null;
        blob = null;
		return array;
	}
}