import { Color } from 'three';
import { MetadataTable } from '../../layer/layer';
import { Style } from './style/style';


function computeColorTable(styles: Style[], baseColor: number, metadataTable: MetadataTable) {
    const colorTable = new Map<number, Color>();
    for (const obj in metadataTable) {
        let color = baseColor;
        for (let i = 0; i < styles.length; i++)
            color = styles[i].apply(metadataTable[obj]) ?? color;
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


export function applyStyle(styles: string[], baseColor: number, geom: THREE.BufferGeometry, metadata: MetadataTable) {
    const ids = geom.getAttribute('ids')?.array as Float32Array;
    const stylesCls = [];
    for (let i = 0; i < styles.length; i++)
        stylesCls.push(Style.deserialize(styles[i]));
    const colorTable = computeColorTable(stylesCls, baseColor, metadata);
    const colorBuffer = computeColorBuffer(ids, colorTable);
    return colorBuffer;
}