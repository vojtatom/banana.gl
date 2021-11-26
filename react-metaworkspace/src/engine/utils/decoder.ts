
const STEP = 10000;

export class Decoder {
    static base64tofloat32(data: string,  abort: CallableFunction, callback: CallableFunction) {   
        let i = 0, j = 0;
        const step = 16 * STEP;
        const length = Math.floor((data.length / 16) * 3);
        let buffer = new Float32Array(length);

        const iter = () => {
            const s = atob(data.substr(i, step));
            const d = new DataView(Uint8Array.from(s, c => c.charCodeAt(0)).buffer);
            
            for(let k = 0; k < d.byteLength; k += 4)
                buffer[j++] = d.getFloat32(k, true);

            if (abort())
                return;

            i += step;
            if (i >= data.length)
            {
                callback(buffer);
                buffer = null as any;
            }
            else
                setTimeout(iter, 10);
        };

        setTimeout(iter, 10);
    }

    static base64toint32(data: string, offset: number = 0, abort: CallableFunction, callback: CallableFunction) {        
        let i = 0, j = 0;
        const step = 16 * STEP;
        const length = Math.floor((data.length / 16) * 3);
        let buffer = new Int32Array(length);

        const iter = () => {
            const s = atob(data.substr(i, step));
            const d = new DataView(Uint8Array.from(s, c => c.charCodeAt(0)).buffer);
            
            for(let k = 0; k < d.byteLength; k += 4)
                buffer[j++] = d.getInt32(k, true) + offset;

            if (abort())
                return;

            i += step;
            if (i >= data.length)
            {
                callback(new Uint8Array(buffer.buffer));
                buffer = null as any;
            }
            else
                setTimeout(iter, 10);
        };

        setTimeout(iter, 10);
    }

    static base64touint8(data: string, callback: CallableFunction) {
        let i = 0, j = 0;
        const step = 4 * STEP;
        const length = Math.floor((data.length / 4) * 3);
        let buffer = new Uint8Array(length);

        const iter = () => {
            const s = atob(data.substr(i, step));
            const d = Uint8Array.from(s, c => c.charCodeAt(0));
            
            for(let k = 0; k < d.length; k++)
                buffer[j++] = d[k];


            i += step;
            if (i >= data.length)
            {
                callback(buffer);
                buffer = null as any;
            }
            else
                setTimeout(iter, 10);
        };

        setTimeout(iter, 10);
    }
}