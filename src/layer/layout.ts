import axios, { AxiosResponse } from 'axios';
import * as THREE from "three";
import { LayerProps } from './layer';
import { layoutUrl, median, notLoadedError } from './utils';


export interface TileType {
    x: number;
    y: number;
    file: string;
    size: number;
    loaded: boolean;
}


export interface LayoutType {
    tileWidth: number;
    tileHeight: number;
    tiles: TileType[];
}

export function Layout(props: LayerProps, onLoad: (layout: THREE.Vector3) => void) {
    let layout: LayoutType;
    let halfx: number, halfy: number;
    const path = layoutUrl(props.api);

    axios.get(path).then((response) => {
        init(response);
        onLoad(computeCenter());
    }).catch((error) => {
        console.error(notLoadedError(path));
        console.error(error);
    });

    const getTiles = (x: number, y: number) => {
        if (layout)
            return layout.tiles.filter((tile) => loadable(tile, x, y));
        return [];
    };

    return {
        getTiles
    };

    function init(response: AxiosResponse<any, any>) {
        layout = response.data;
        halfx = layout.tileWidth * 0.5;
        halfy = layout.tileHeight * 0.5;
    }

    function loadable(tile: TileType, x: number, y: number) {
        if (tile.loaded)
            return false;
        return Math.abs(tile.x + halfx - x) < props.loadRadius
            && Math.abs(tile.y + halfy - y) < props.loadRadius;
    }

    function computeCenter() {
        const xmedian = median(layout.tiles.map((tile) => tile.x));
        const ymedian = median(layout.tiles.map((tile) => tile.y));
        return new THREE.Vector3(
            xmedian * layout.tileWidth,
            ymedian * layout.tileHeight,
            0);
    }
}