import { LayerLoader } from "./loader";
import { Graphics } from "./graphics";
import { ObjectSelection } from "./selection";
import { MaterialLibrary, MaterialLibraryProps } from "./material";
import { Style } from "./styles";
export declare type LayerProps = {
    path: string;
    name?: string;
    material?: MaterialLibraryProps;
    pickable?: boolean;
    styles?: Style[];
};
export declare type MetadataTable = {
    [id: number]: any;
};
declare type ParsedGeometry = {
    positions: Float32Array;
    normals: Float32Array;
    ids: Float32Array;
    metadata: MetadataTable;
};
export declare class Layer {
    name: string;
    metadata: MetadataTable;
    styles: Style[];
    selection: ObjectSelection[];
    readonly loader: LayerLoader;
    readonly graphics: Graphics;
    readonly materialLibrary: MaterialLibrary;
    readonly pickable: boolean;
    constructor(props: LayerProps, graphics: Graphics);
    locate(x: number, y: number): void;
    private addMetadata;
    private getMetadata;
    select(id: number): void;
    deselect(): void;
    onDataLoaded(parsed_geometry: ParsedGeometry): void;
}
export {};
