import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from '../context/materials';
import { Layout } from './layout';
import * as THREE from 'three';
import { PointInstanceModel } from './instance';
import { TileContainer } from './lod/container';


export interface Layer {
    materials: MaterialLibrary;
    pickable: boolean;
    ctx: GraphicContext;
    name: string;
    layout: Layout;
    api: string;
    lodLimits: number[];
    instance?: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[];
}

export interface LayerProps extends MaterialLibraryProps {
    api: string;
    loadRadius?: number;
    name?: string;
    pickable?: boolean;
    pointInstance?: string;
    lodLimits?: number[];
}

function propsDefaults(props: LayerProps) {
    props.name = props.name ?? props.api;
    props.pickable = props.pickable ?? false;
    props.lodLimits = props.lodLimits ?? [20000];
}

export function Layer(ctx: GraphicContext, props: LayerProps) {
    propsDefaults(props);
    const materials = MaterialLibrary(props);
    const instance = props.pointInstance ? PointInstanceModel(props.pointInstance) : undefined;
    
    ctx.navigation.onchange = (target: THREE.Vector3) => {
        loadTiles(target);
    }; 

    const layout = Layout(props, (center) => {
        ctx.navigation.positionCameraIfNotSet(center);
        loadTiles(ctx.navigation.target);
    });

    const layer: Layer = {
        name: props.name!,
        api: props.api,
        pickable: props.pickable!,
        lodLimits: props.lodLimits!,
        layout,
        materials,
        instance,
        ctx
    };

    const tileContainer = TileContainer(layer);

    function loadTiles(target: THREE.Vector3) {
        const tiles = layout.getTilesToLoad(target.x, target.y);
        tileContainer.load(tiles);
    } 
}
