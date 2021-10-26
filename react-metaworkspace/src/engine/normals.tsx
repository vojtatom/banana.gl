/*import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'


function square(x: number, y: number, z: number, side: number) {
    return new Float32Array( [
        x,        y,        z,
        x + side, y,        z,
        x + side, y + side, z,
        x + side, y + side, z,
        x,        y + side, z,
        x,        y,        z
    ] );
}



class Decoder {
    static base64tofloat32(data: string) {
        let blob: string|null = window.atob(data);
		let array;
        let len = blob.length / Float32Array.BYTES_PER_ELEMENT;
        let view: DataView|null = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT));
        array = new Float32Array(len);
        
        for (let p = 0; p < len * 4; p = p + 4) {
            view.setUint8(0, blob.charCodeAt(p));
            view.setUint8(1, blob.charCodeAt(p + 1));
            view.setUint8(2, blob.charCodeAt(p + 2));
            view.setUint8(3, blob.charCodeAt(p + 3));
            array[p / 4] = view.getFloat32(0, true);
        }
        view = null;
        blob = null;
        return array;
    }
    
    static base64toint32(data: string) {
        let blob:  string|null = window.atob(data);
        let array;
        let len = blob.length / Int32Array.BYTES_PER_ELEMENT;
        let view: DataView|null = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
        array = new Int32Array(len);
        
        for (let p = 0; p < len * 4; p = p + 4) {
            view.setUint8(0, blob.charCodeAt(p));
            view.setUint8(1, blob.charCodeAt(p + 1));
            view.setUint8(2, blob.charCodeAt(p + 2));
            view.setUint8(3, blob.charCodeAt(p + 3));
            array[p / 4] = view.getInt32(0, true);
        }
        view = null;
        blob = null;
		return array;
	}
}

function linearToIndexed(invertices: Float32Array) {
    const vertices = [];
    const indices = [];
    let vid = 0;
    let idx;
    let xm = new Map<number, Map<number, Map<number, number>>>(), ym, zm;


    for(let i = 0; i < invertices.length; i += 3) {
        let x = invertices[i];
        let y = invertices[i + 1];
        let z = invertices[i + 2];
    
        if (!(ym = xm.get(x))){
            ym = new Map<number, Map<number, number>>();
            xm.set(x, ym);
        }

        if (!(zm = ym.get(y))) {
            zm = new Map<number, number>();
            ym.set(y, zm);
        }

        if (!(idx = zm.get(z))) {
            idx = vid++;
            zm.set(z, idx);
            vertices.push(x, y, z);
        }

        indices.push(idx);
    }


    let tmp;
    for(let i = 0; i < indices.length;  i += 3) {
        tmp = indices[i];
        indices[i] = indices[i + 1];
        indices[i + 1] = tmp;
    }

    return {
        vertices: new Float32Array(vertices),
        indices: indices
    };
}
*/

export {}
