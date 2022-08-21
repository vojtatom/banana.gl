import { Layer } from '../layer';
import { TileConfig } from '../layout';
import { TileLOD } from './lod';


export interface Tile {
    selectLOD: (camTar: THREE.Vector3, camPos: THREE.Vector3) => void;
    get config(): TileConfig;
    get LODs(): (TileLOD | undefined)[];
}


export function Tile(layer: Layer, config: TileConfig): Tile {
    const LODs: (TileLOD | undefined)[] = [undefined, undefined];

    const selectLOD = (camTar: THREE.Vector3, camPos: THREE.Vector3) => {
        const level = getLevel(camTar, camPos);
        selectLevel(level);
    };

    const tile = {
        selectLOD,
        get config() { return config; },
        get LODs() { return LODs; }
    };

    return tile;

    function getLevel(camTar: THREE.Vector3, camPos: THREE.Vector3) {
        const distance = layer.layout.tileDistanceSqr(camPos, config);
        if (distance < layer.lodLimits[0] * layer.lodLimits[0])
            return 1;
        return 0;
    }

    function selectLevel(level: number) {
        activateLevel(level);
        hideNoneactiveLevels(level);
    }

    function hideNoneactiveLevels(level: number) {
        for (let i = 0; i < LODs.length; i++) {
            if (i != level)
                LODs[i]?.hide();
        }
    }

    function activateLevel(level: number) {
        if (!LODs[level])
            LODs[level] = TileLOD(tile, layer, level);
        LODs[level]?.select();
    }
}

