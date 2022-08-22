import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from '../context/materials';
import { Layout } from './layout';
import * as THREE from 'three';
import { PointInstanceModel } from './geometry/instance';
import { TileContainer } from './lod/container';
import { Style } from '../loader/style/style';

export type MetadataRecord = any;
export type MetadataTable = {[id: number]: MetadataRecord}

export interface Layer {
    materials: MaterialLibrary;
    pickable: boolean;
    ctx: GraphicContext;
    name: string;
    layout: Layout;
    api: string;
    lodLimits: number[];
    instance?: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[];
    metadata: MetadataTable;
    get useVertexColors(): boolean;
    styles: string[];
    getMetadata(id: number): MetadataRecord;
}

export interface LayerProps extends MaterialLibraryProps {
    api: string;
    loadRadius?: number;
    name?: string;
    pickable?: boolean;
    pointInstance?: string;
    lodLimits?: number[];
    styles?: Style[];
}

function propsDefaults(props: LayerProps) {
    props.name = props.name ?? props.api;
    props.pickable = props.pickable ?? false;
    props.lodLimits = props.lodLimits ?? [20000];
    props.loadRadius = props.loadRadius ?? 2000;
    props.styles = props.styles ?? [];
}

export function Layer(ctx: GraphicContext, props: LayerProps): Layer {
    propsDefaults(props);
    const useVertexColors = props.styles!.length > 0;
    const materials = MaterialLibrary(props, useVertexColors);
    const instance = props.pointInstance ? PointInstanceModel(props.pointInstance) : undefined;
    const metadata: MetadataTable = {};
    
    ctx.navigation.onchange = (target: THREE.Vector3) => {
        loadTiles(target);
    }; 

    const layout = Layout(props, (center) => {
        ctx.navigation.positionCameraIfNotSet(center);
        loadTiles(ctx.navigation.target);
    });

    const serialized = [];
    const styles: Style[] = props.styles ?? [];
    for (let i = 0; i < styles.length; i++)
        serialized.push(styles[i].serialize());


    const layer: Layer = {
        name: props.name ?? props.api,
        api: props.api,
        pickable: props.pickable ?? false,
        lodLimits: props.lodLimits ?? [],
        layout,
        materials,
        instance,
        ctx,
        metadata,
        styles: serialized,
        get useVertexColors() { return useVertexColors; },
        getMetadata(id: number) {
            return metadata[id];
        }
    };

    const tileContainer = TileContainer(layer);

    function loadTiles(target: THREE.Vector3) {
        const tiles = layout.getTilesToLoad(target.x, target.y);
        tileContainer.load(tiles);
    } 

    return layer;
}
