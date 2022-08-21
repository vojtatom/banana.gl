import { Layer } from '../layer';
import { ParsedData } from '../../loader/worker';
import { MeshGeometry } from '../geometry/mesh';
import { PointsGeometry } from '../geometry/points';
import { CullableInstancedMesh } from '../geometry/cullable';
import { Tile } from './tile';
import { TileLODLoader } from './loader';



export interface TileLOD {
    get loader(): TileLODLoader;
    select: () => void;
    hide: () => void;
}


export function TileLOD(tile: Tile, layer: Layer, level: number): TileLOD {
    let mesh: THREE.Mesh | undefined;
    let points: THREE.Points | CullableInstancedMesh[] | undefined;
    const loader = TileLODLoader(tile, layer, level);

    const select = () => {
        if (!mesh && !points) {
            loader.request((data: ParsedData) => {
                dataToGeometry(data);
            });
        } else {
            setMeshVisibility(true);
            setPointsVisibility(true);
        }
    };

    const hide = () => {
        setMeshVisibility(false);
        setPointsVisibility(false);
    };
            
    return {
        select,
        hide,
        loader
    };

    function dataToGeometry(data: ParsedData) {
        mesh = MeshGeometry(data, layer);
        //The only actual LOD difference for now
        if (level == 0)
            points = PointsGeometry(data, layer);
        else
            points = PointsGeometry(data, layer, layer.instance);
    }

    function setMeshVisibility(visible: boolean) {
        if (mesh)
            mesh.visible = visible;
    }

    function setPointsVisibility(visible: boolean) {
        if (points) {
            if (Array.isArray(points))
                points.forEach(p => p.visible = visible);

            else
                points.visible = visible;
        }
    }
}

