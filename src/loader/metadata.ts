import * as THREE from "three";
import { Model } from "./geometries";
import { ModelGroups } from "./group";


function createIDBuffer(size: number, id: number) {
    const buffer = new THREE.BufferAttribute(new Float32Array(size * 3), 3);
    const color = new THREE.Color();
    color.setHex(id);

    for (let i = 0; i < size; i++)
        buffer.setXYZ(i, color.r, color.g, color.b);

    return buffer;
}

function enrichMetadata(model: Model) {
    const bbox = new THREE.Box3();
    bbox.setFromObject(model);
    model.userData.bbox = [bbox.min.toArray(), bbox.max.toArray()];
    model.userData.baseHeight = bbox.min.z;
    model.userData.height = bbox.max.z - bbox.min.z;
}

enum MetaProcessing {
    None,
    Enrich
};


function processModelMetadata(model: Model, metadata: any, enrich?: MetaProcessing) {
    const geometry = model.geometry;
    const ids = createIDBuffer(geometry.attributes.position.count, metadata.id);
    geometry.setAttribute('ids', ids);

    if (enrich === MetaProcessing.Enrich)
        enrichMetadata(model);

    metadata[metadata.id] = model.userData;
    metadata.id++;
}


export function assignMetadataIds(models: ModelGroups, idOffset: number) {
    const metadata = {
        id: idOffset,
    };

    models.points.forEach(points => processModelMetadata(points, metadata));
    models.meshes.forEach(mesh => processModelMetadata(mesh, metadata, MetaProcessing.Enrich));

    return metadata;
}
