import { Vector3 } from "three";


export type IBBox = [[number, number, number], [number, number, number]];
export type IBRect = [[number, number], [number, number]];

export type NumToStr = { [id: number]: string };
export type StrToNum = { [ois: string]: number };

export interface IGridData {
    bbox: IBBox,
    id_counter: number,
    id_to_oid: NumToStr,
    oid_to_id: StrToNum,
    resolution: [number, number],
    tile_size: number,
}

export interface ILayerData {
    grid: IGridData,
    name: string,
    project: string,
    shift: [number, number, number]
}

export interface ILayer {
    project: string,
    name: string
}