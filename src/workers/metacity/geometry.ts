import { ModelGroups, Model } from './group';


function merge(models: Model[]) {
    if (models.length === 0)
        return undefined;

    const length = models.reduce((acc, model) => acc + model.positions.length, 0);
    const positions = new Float32Array(length);
    const ids = new Float32Array(length);

    let offset = 0;
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        positions.set(model.positions, offset);
        if (model.ids)
            ids.set(model.ids, offset);

        offset += model.positions.length;
    }

    return {
        positions,
        ids,
    };
}

function cross(a: number[], b: number[], out: number[]) {
    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];
}

function normalize(v: number[]) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    v[0] /= length;
    v[1] /= length;
    v[2] /= length;
}


function computeNormals(mesh?: { positions: Float32Array }) {
    if (!mesh)
        return undefined;

    const { positions } = mesh;
    const normals = new Float32Array(positions.length);
    const v2 = [0, 0, 0];
    const v3 = [0, 0, 0];
    const n = [0, 0, 0];

    for (let i = 0; i < positions.length;) {
        v2[0] = positions[i + 3] - positions[i];
        v2[1] = positions[i + 4] - positions[i + 1];
        v2[2] = positions[i + 5] - positions[i + 2];
        v3[0] = positions[i + 6] - positions[i];
        v3[1] = positions[i + 7] - positions[i + 1];
        v3[2] = positions[i + 8] - positions[i + 2];

        cross(v2, v3, n);
        normalize(n);

        normals[i++] = n[0];
        normals[i++] = n[1];
        normals[i++] = n[2];
        normals[i++] = n[0];
        normals[i++] = n[1];
        normals[i++] = n[2];
        normals[i++] = n[0];
        normals[i++] = n[1];
        normals[i++] = n[2];
    }

    return normals;
}


export function mergeGeometries(models: ModelGroups) {
    const meshes = merge(models.meshes);
    const meshNormals = computeNormals(meshes);
    const points = merge(models.points);
    return {
        mesh: {
            positions: meshes?.positions,
            normals: meshNormals,
            ids: meshes?.ids,
        },
        point: {
            positions: points?.positions,
            ids: points?.ids,
        },
    }
}

