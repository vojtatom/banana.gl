import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from '../context/materials';
import { Layout, TileType } from './layout';
import THREE from 'three';
import { ParsedData } from '../loader/worker';
import { MeshGeometry } from './mesh';
import { PointInstanceModel } from './instance';
import { PointsGeometry } from './points';


export interface Layer {
    materials: MaterialLibrary;
    pickable: boolean;
    ctx: GraphicContext;
    name: string;
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
        materials,
        pickable: props.pickable ?? false,
        ctx
    };

    function loadTiles(target: THREE.Vector3) {
        console.log(`Loading tiles for ${name}`, target);
        const tiles = layout.getTiles(target.x, target.y);
        tiles.forEach(tile => loadTile(tile));
    }; 

    function loadTile(tile: TileType) {
        tile.loaded = true;
        ctx.loader.process({
            file: tileURL(props.api, tile),
            objectsToLoad: tile.size
        }, (data) =>{
            display(data);
        });
    }

    function display(data: ParsedData) {
        MeshGeometry(data, layer);
        PointsGeometry(data, layer, instance);
    }
}