import { MeshData, PointData } from "../../geometry/dataInterface";

export type TileRequestData = {
    file: string, 
    objectsToLoad: number,
    styles: string[],
    baseColor: number,
};


export interface InputData {
    file: string;
    idOffset: number;
    styles: string[];
    baseColor: number;
}

export interface ParsedData {
    metadata: {
        id: number;
        [id: number]: any;
    };
    mesh: MeshData | undefined;
    points: PointData | undefined;
}