import { Layer } from '../layer';
import { TileConfig } from '../layout';
import { Tile } from './tile';

export interface TileContainer {
    load: (tconfigs: TileConfig[]) => void;
}

export function TileContainer(layer: Layer): TileContainer {
    const tiles = new Map<string, Tile>();

    const load = (tconfigs: TileConfig[]) => {
        const camPos = layer.ctx.navigation.position;
        const camTar = layer.ctx.navigation.target;
        
        for (const tconfig of tconfigs) {
            const tile = prepareTile(tconfig);
            tile.selectLOD(camTar, camPos);
        }
    };

    return {
        load
    };

    function prepareTile(tconfig: TileConfig) {
        const key = tileKey(tconfig);
        let tile = tiles.get(key);
        if (!tile) {
            tile = Tile(layer, tconfig);
            tiles.set(key, tile);
        }
        return tile;
    }

    function tileKey(tile: TileConfig) {
        return `${tile.x},${tile.y}`;
    }
}

