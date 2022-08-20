import { Layer, MetadataTable } from '../layer';
import { ParsedData } from '../../loader/worker';
import { LoadingAnimation } from '../geometry/loading';
import { Tile } from './tile';
import { TileConfig } from '../layout';


function tileURL(api: string, tile: TileConfig) {
    return `${api}/${tile.file}`;
}


enum PoolingStatus{
    WaitingForPooledData,
    NotFound,
    Found
}

export interface TileLODLoader {
    request: (fn: (data: ParsedData) => void) => void;
    get data(): ParsedData | undefined;
    get dataRequested(): boolean;
    set ondataload(fn: (data: ParsedData) => void);
}

export function TileLODLoader(tile: Tile, layer: Layer, level: number) : TileLODLoader {
    let data: ParsedData | undefined; //TODO would be lovely to get rid of this
    let ondataloadfns: ((data: ParsedData) => void)[] = [];
    let dataRequested = false;


    const request = (fn: (data: ParsedData) => void) => {
        if (dataRequested)
            return;

        dataRequested = true;
        ondataloadfns.push(fn);
        loadGeometry();
    };

    return {
        request,
        get data() {
            return data;
        },
        get dataRequested() {
            return dataRequested;
        },
        set ondataload(fn: (data: ParsedData) => void) {
            ondataloadfns.push(fn);
        }
    };

    function loadGeometry() {
        const poolStatus = pollData();
        if (poolStatus === PoolingStatus.NotFound) {
            const animation = LoadingAnimation(tile.config, layer);
            loadGeometryData(animation);
        } if (poolStatus === PoolingStatus.Found) {
            yieldData(data!);
        }
    }

    function loadGeometryData(animation: LoadingAnimation) {
        layer.ctx.loader.process({
            file: tileURL(layer.api, tile.config),
            objectsToLoad: tile.config.size,
            styles: layer.styles,
            baseColor: layer.materials.baseColor
        }, (loadedData) => {
            animation.stop();
            data = loadedData;
            addMetadata(loadedData.metadata);
            yieldData(loadedData);
        });
    }

    function pollData() {
        for (let i = 0; i < tile.LODs.length; i++) {
            if (i === level)
                continue;
            const loader = tile.LODs[i]?.loader;
            const polledData = loader?.data;
            if (polledData){
                data = polledData;
                return PoolingStatus.Found;
            }
                
            if (loader?.dataRequested){
                loader.ondataload = (pooledData) => {
                    data = pooledData;
                    yieldData(pooledData);
                };
                return PoolingStatus.WaitingForPooledData;
            }
        }
        return PoolingStatus.NotFound;
    }

    function yieldData(loadedData: ParsedData) {
        const l = ondataloadfns.length;
        for (let i = 0; i < l; i++) {
            ondataloadfns[i](loadedData);
        }
        ondataloadfns = [];
    }

    function addMetadata(metadata: MetadataTable) {
        for (const id in metadata) {
            layer.metadata[id] = metadata[id];
        }
    }
}