import { Layer } from "../layer";
import { TileConfig } from "../layout";
import { ParsedData } from '../../loader/worker';
import { MeshGeometry } from '../geometry/mesh';
import { PointsGeometry } from '../geometry/points';
import { LoadingAnimation } from '../geometry/loading';
import { CullableInstancedMesh } from "../cullable";
import { Tile } from "./tile";


export interface TileLOD {
    get data(): ParsedData | undefined;
    get dataRequested(): boolean;
    set ondataload(fn: (data: ParsedData) => void);
    select: () => void;
    hide: () => void;
}

enum PoolingStatus{
    WaitingForPooledData,
    NotFound,
    Found
}


function tileURL(api: string, tile: TileConfig) {
    return `${api}/${tile.file}`;
}

export function TileLOD(tile: Tile, layer: Layer, level: number): TileLOD {
    let mesh: THREE.Mesh | undefined;
    let points: THREE.Points | CullableInstancedMesh[] | undefined;
    let data: ParsedData | undefined;
    let ondataloadfns: ((data: ParsedData) => void)[] = [];
    let dataRequested = false;

    const select = () => {
        if (!mesh && !points) {
            if(!dataRequested) {
                loadGeometry();
                dataRequested = true;
            }
        } else {
            displayLoaded();
        }
    };

    const hide = () => {
        if (mesh)
            mesh.visible = false;
        if (points){
            if (Array.isArray(points))
                points.forEach(p => p.visible = false);
            else
                points.visible = false;
        }
    };
            

    return {
        select,
        hide,
        get data() { return data; },
        get dataRequested() { return dataRequested; },
        set ondataload(fn: (data: ParsedData) => void) {
            ondataloadfns.push(fn);
        }
    };


    function displayLoaded() {
        if (mesh)
            mesh.visible = true;
        if (points)
            if (Array.isArray(points))
                points.forEach(p => p.visible = true);

            else
                points.visible = true;
    }

    function loadGeometry() {
        const poolStatus = pollData();
        if (poolStatus === PoolingStatus.NotFound) {
            const animation = LoadingAnimation(tile.config, layer);
            loadGeometryData(animation);
        } if (poolStatus === PoolingStatus.Found) {
            dataToGeometry(data!);
        }
    }

    function loadGeometryData(animation: LoadingAnimation) {
        layer.ctx.loader.process({
            file: tileURL(layer.api, tile.config),
            objectsToLoad: tile.config.size
        }, (loadedData) => {
            animation.stop();
            data = loadedData;
            dataToGeometry(loadedData);
            ondataloadfns.forEach(fn => fn(loadedData));
            ondataloadfns = [];
        });
    }

    function dataToGeometry(data: ParsedData) {
        mesh = MeshGeometry(data, layer);

        //The only actual LOD difference for now
        if (level == 0)
            points = PointsGeometry(data, layer);
        else
        points = PointsGeometry(data, layer, layer.instance);
    }

    function pollData() {
        for (let i = 0; i < tile.LODs.length; i++) {
            const polledData = tile.LODs[i]?.data;
            if (polledData){
                data = polledData;
                return PoolingStatus.Found;
            }
                
            if (tile.LODs[i]?.dataRequested){
                tile.LODs[i]!.ondataload = (pooledData) => {
                    data = pooledData;
                    dataToGeometry(pooledData);
                };
                return PoolingStatus.WaitingForPooledData;
            }
        }
        return PoolingStatus.NotFound;
    }
}

