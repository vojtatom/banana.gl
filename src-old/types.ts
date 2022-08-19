import { MaterialLibraryProps } from './material';
import { Style } from './styles';


export enum LayerType {
    None,
    Mesh,
    Points
}

export type ParsedGeometry = {
    positions: Float32Array;
    normals: Float32Array;
    ids: Float32Array;
    metadata: MetadataTable;
    type: LayerType;
}

export type LayerProps = {
    path: string;
    name?: string;
    material?: MaterialLibraryProps;
    pickable?: boolean;
    styles?: Style[];
    points?: {
        instanceModel?: string;
    }
}

export type TileType = {
    x: number;
    y: number;
    file: string;
    size: number;
    loaded: boolean;
}


export type LayoutType = {
    tileWidth: number;
    tileHeight: number;
    tiles: TileType[];
}


export type MetadataRecord = any;
export type MetadataTable = {[id: number]: any};