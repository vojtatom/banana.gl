import { Layer } from "../layer";
import { TileConfig } from "../layout";
import { Tile } from "./tile";

export interface TileContainer {
    load: (tconfigs: TileConfig[]) => void;
}

export function TileContainer(layer: Layer): TileContainer {
    let tiles = new Map<string, Tile>();

    const load = (tconfigs: TileConfig[]) => {
        for (let tconfig of tconfigs)
            prepareTile(tconfig);
        const camPos = layer.ctx.navigation.position;
        const camTar = layer.ctx.navigation.target;
        for (let tile of tiles.values())
            tile.selectLOD(camTar, camPos);
    }

    return {
        load
    }

    function prepareTile(tconfig: TileConfig) {
        const key = tileKey(tconfig);
        let tile = tiles.get(key);
        if (!tile) {
            tile = Tile(layer, tconfig);
            tiles.set(key, tile);
        }
    }

    function tileKey(tile: TileConfig) {
        return `${tile.x},${tile.y}`;
    }
}

