import axios, { AxiosResponse } from 'axios';
import * as THREE from 'three';
import { LayerProps } from './layer';
import { layoutUrl, median, notLoadedError } from './utils';


export interface TileConfig {
    x: number;
    y: number;
    file: string;
    size: number;
}


export interface LayoutConfig {
    tileWidth: number;
    tileHeight: number;
    tiles: TileConfig[];
}


export interface Layout {
    getTilesToLoad(x: number, y: number): TileConfig[];
    tileDistanceSqr(loc: THREE.Vector3, tile: TileConfig): number;
    get tileDims(): { tileWidth: number, tileHeight: number };
}

export function Layout(props: LayerProps, onLoad: (layout: THREE.Vector3) => void): Layout {
    let layout: LayoutConfig;
    let halfx: number, halfy: number;
    const radius = props.loadRadius!;
    const path = layoutUrl(props.api);

    axios.get(path).then((response) => {
        init(response);
        onLoad(computeCenter());
    }).catch((error) => {
        console.error(notLoadedError(path));
        console.error(error);
    });

    const getTilesToLoad = (x: number, y: number) => {
        if (layout)
            return layout.tiles.filter((tile) => loadable(tile, x, y));
        return [];
    };

    const tileDistanceSqr = (loc: THREE.Vector3, tile: TileConfig) => {
        const x = tile.x * layout.tileWidth + halfx - loc.x;
        const y = tile.y * layout.tileHeight + halfy - loc.y;
        return x * x + y * y + loc.z * loc.z;
    };

    return {
        getTilesToLoad,
        tileDistanceSqr,
        get tileDims() {
            if (!layout)
                return { tileWidth: 0, tileHeight: 0 };
            return { tileWidth: layout.tileWidth, tileHeight: layout.tileHeight };
        }
    };

    function init(response: AxiosResponse<any, any>) {
        layout = response.data;
        halfx = layout.tileWidth * 0.5;
        halfy = layout.tileHeight * 0.5;
    }

    function loadable(tile: TileConfig, x: number, y: number) {
        return Math.abs(tile.x * layout.tileWidth + halfx - x) < radius
            && Math.abs(tile.y * layout.tileHeight + halfy - y) < radius;
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