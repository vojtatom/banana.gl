import { Vector2, Vector3 } from "three";


export type IBBox = [[number, number, number], [number, number, number]];
export type IVecBBox = [Vector3, Vector3];
export type IBRect = [[number, number], [number, number]];

export interface ITile {
    box: IBBox,
    x: number,
    y: number,
    file: string
}

export interface IInterval {
    start_time: number;
    file: string;
}

export interface IGrid {
    tile_size: number,
    tiles: ITile[]
}

export interface ITimeline {
    interval_length: number,
    intervals: IInterval[]
}

export interface ILayerBaseData {
    grid?: IGrid,
    timeline?: ITimeline,
    name: string,
    init: boolean,  
}

export interface ILayerData extends ILayerBaseData {
    size: number
}

export interface IOverlayData extends ILayerBaseData {
    source: string,
    target: string
    size: [number, number]
}

export interface IAttribute {
    data: string,
    type: string,
}

export interface IModel {
    attributes: {[name: string]: IAttribute};
    tags: {[name: string]: any},
    type: string,
    vertices: string
}

export interface IMovement {
    from: string[];
    from_speed: string[];
    to: string[];
    to_speed: string[];
    oid: string[];
    start_time: number;
    end_time: number;
    length: number
}

export interface IMove {
    from: string;
    to: string;
    oid: string;
    time: number;
    from_speed: string;
    to_speed: string;
}

export interface ILayerStyle {
    pickable?: boolean;
    visible?: boolean;
    buffer?: string | Uint8Array; 
    buffer_source?: string | Uint8Array;
    buffer_target?: string | Uint8Array;
}

export interface AreaSelection {
    start: [number, number];
    end: [number, number];
    size: [number, number];
} 