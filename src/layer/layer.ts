import { GraphicContext } from "../context/context";
import { MaterialLibrary, MaterialLibraryProps } from "../context/materials";
import { Layout, TileType } from "./layout";
import THREE from "three";


export interface LayerProps extends MaterialLibraryProps {
    api: string;
    loadRadius: number;
    name?: string;
    pickable?: boolean;
}


function loadTile(tile: TileType, props: LayerProps, materials: MaterialLibrary) {
    tile.loaded = true;
    

}


export function Layer(ctx: GraphicContext, props: LayerProps) {
    const materials = MaterialLibrary(props);
    const name = props.name ?? props.api;
    const layout = Layout(props, (center) => {
        ctx.navigation.focusIfNotSet(center);
    });

    ctx.navigation.onchange = (target: THREE.Vector3) => {
        const tiles = layout.getTiles(target.x, target.y);
        tiles.forEach(tile => loadTile(tile, props, materials));
    } 
}