import { ModelGroups } from './group';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Model = THREE.Mesh | THREE.Points;


function merge(models: Model[]) {
    if (models.length === 0)
        return undefined;

    const geometries = [];
    for (let i = 0; i < models.length; i++)
        geometries.push(models[i].geometry);

    return mergeBufferGeometries(geometries);
}


export function mergeGeometries(models: ModelGroups) {
    const meshes = merge(models.meshes);
    const points = merge(models.points);

    if (meshes)
        meshes.computeVertexNormals();

    return {
        meshes,
        points,
    };
}