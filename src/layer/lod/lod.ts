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
    select: () => void;
    hide: () => void;
}

export function TileLOD(tile: Tile, layer: Layer, level: number): TileLOD {
    let mesh: THREE.Mesh | undefined;
    let points: THREE.Points | CullableInstancedMesh[] | undefined;
    let data: ParsedData | undefined;

    const select = () => {
        if (!mesh && !points) {
            loadGeometry();
        } else {
            display();
        }
    };

    const hide = () => {
        if (mesh)
            mesh.visible = false;
        if (points)
            if (Array.isArray(points))
                points.forEach(p => p.visible = false);
            else
                points.visible = false;
    };

    return {
        select,
        hide,
        get data() { return data; }
    };


    function display() {
        if (mesh)
            mesh.visible = true;
        if (points)
            if (Array.isArray(points))
                points.forEach(p => p.visible = true);

            else
                points.visible = true;
    }

    function loadGeometry() {
        data = pollData();
        if (!data) {
            const animation = LoadingAnimation(tile.config, layer);
            loadGeometryData(animation);
        } else {
            dataToGeometry(data);
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
            if (polledData)
                return polledData;
        }
    }

    function tileURL(api: string, tile: TileConfig) {
        return `${api}/${tile.file}`;
    }
}

