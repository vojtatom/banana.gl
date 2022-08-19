import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from '../context/materials';
import { Layout, TileType } from './layout';
import * as THREE from 'three';
import { ParsedData } from '../loader/worker';
import { MeshGeometry } from './mesh';
import { PointInstanceModel } from './instance';
import { PointsGeometry } from './points';
import { LoadingAnimation } from './loading';


export interface Layer {
    materials: MaterialLibrary;
    pickable: boolean;
    ctx: GraphicContext;
    name: string;
    layout: Layout;
}

export interface LayerProps extends MaterialLibraryProps {
    api: string;
    loadRadius?: number;
    name?: string;
    pickable?: boolean;
    pointInstance?: string;
}

function tileURL(api: string, tile: TileType) {
    return `${api}/${tile.file}`;
}

export function Layer(ctx: GraphicContext, props: LayerProps) {
    const materials = MaterialLibrary(props);
    const name = props.name ?? props.api;
    const instance = props.pointInstance ? PointInstanceModel(props.pointInstance) : undefined;
    
    ctx.navigation.onchange = (target: THREE.Vector3) => {
        loadTiles(target);
    }; 

    const layout = Layout(props, (center) => {
        ctx.navigation.focusIfNotSet(center);
        loadTiles(ctx.navigation.coordinates);
    });

    let layer: Layer = {
        name,
        layout,
        materials,
        pickable: props.pickable ?? false,
        ctx
    };

    function loadTiles(target: THREE.Vector3) {
        const tiles = layout.getTilesToLoad(target.x, target.y);
        tiles.forEach(tile => {
            const animation = LoadingAnimation(tile, layer);
            loadTile(tile, animation);
        });
    }; 

    function loadTile(tile: TileType, animation: LoadingAnimation) {
        tile.loaded = true;
        ctx.loader.process({
            file: tileURL(props.api, tile),
            objectsToLoad: tile.size
        }, (data) =>{
            animation.stop();
            display(data);
        });
    }

    function display(data: ParsedData) {
        MeshGeometry(data, layer);
        PointsGeometry(data, layer, instance);
    }
}
