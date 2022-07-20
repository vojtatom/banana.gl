import { Style } from './styles';
import { MetadataTable } from './layer';
import { Color } from 'three';


function computeColorTable(style: Style, metadataTable: MetadataTable) {
    const colorTable = new Map<number, Color>();
    for (const obj in metadataTable) {
        const color = style.apply(metadataTable[obj]);
        colorTable.set(parseInt(obj), new Color().setHex(color));
    }
    return colorTable;
}


function computeColorBuffer(ids: Float32Array, colorTable: Map<number, Color>) {
    const colorBuffer = new Float32Array(ids.length);
    const idBuffer = new Uint8Array(4);
    const view = new DataView(idBuffer.buffer);
    idBuffer[0] = 0;

    const idToNumber = (offset: number) => {
        idBuffer[1] = ids[offset] * 255;
        idBuffer[2] = ids[offset + 1] * 255;
        idBuffer[3] = ids[offset + 2] * 255;
        return view.getInt32(0);
    };

    let id, color;
    for (let offset = 0; offset < ids.length; offset += 3) {
        id = idToNumber(offset);
        color = colorTable.get(id);
        if (color) {
            colorBuffer[offset] = color.r;
            colorBuffer[offset + 1] = color.g;
            colorBuffer[offset + 2] = color.b;
        }
    }
    return colorBuffer;
}


function applyStyle(message: MessageEvent) {
    
    const { jobID, data } = message.data;
    const { style, ids, metadata } = data;

    const styleCls = Style.deserialize(style);
    const colorTable = computeColorTable(styleCls, metadata);
    const colorBuffer = computeColorBuffer(ids, colorTable);

    const response = {
        jobID: jobID,
        result: {
            color: colorBuffer
        }
    };

    postMessage(response);
}


//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    applyStyle(message);
};



