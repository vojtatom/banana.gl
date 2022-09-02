import { colorHex } from '../../style/color';
import { Model, ModelGroups } from './group';


function createIDBuffer(size: number, id: number) {
    const buffer = new Float32Array(size);
    const color = colorHex(id);

    for (let i = 0; i < buffer.length;) {
        buffer[i++] = color[0];
        buffer[i++] = color[1];
        buffer[i++] = color[2];
    }

    return buffer;
}

function enrichMetadata(model: Model) {
    model.meta.bbox = model.bbox;
    model.meta.baseHeight = model.bbox[0][2];
    model.meta.height = model.bbox[1][2] - model.bbox[0][2];
}

enum MetaProcessing {
    None,
    Enrich
}


function processModelMetadata(model: Model, metadata: any, enrich?: MetaProcessing) {
    const ids = createIDBuffer(model.positions.length, metadata.id);
    model.ids = ids;

    if (enrich === MetaProcessing.Enrich)
        enrichMetadata(model);

    metadata[metadata.id] = model.meta;
    metadata.id++;
}


export function assignMetadataIds(models: ModelGroups, idOffset: number) {
    const metadata = {
        id: idOffset,
    };

    for (let i = 0; i < models.meshes.length; i++)
        processModelMetadata(models.meshes[i], metadata, MetaProcessing.Enrich);

    for(let i = 0; i < models.points.length; i++)
        processModelMetadata(models.points[i], metadata, MetaProcessing.None);

    return metadata;
}
