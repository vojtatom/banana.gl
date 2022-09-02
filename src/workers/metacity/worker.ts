import { load }  from '@loaders.gl/core';
import { GLTFLoader } from '@loaders.gl/gltf';
import { MessageType } from '../../pools/messageInterface';
import { mergeGeometries } from './geometry';
import { groupBuffersByType } from './group';
import { InputData } from './data';
import { assignMetadataIds } from './metadata';
import { applyStyle } from './style';


//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
};

async function loadModel(message: MessageEvent<MessageType<InputData>>) {
    const { jobID, data } = message.data;
    const { file, idOffset, styles, baseColor } = data;
    const gltf = await load(file, GLTFLoader);
    const groups = groupBuffersByType(gltf);
    const metadata = assignMetadataIds(groups, idOffset);
    const models = mergeGeometries(groups);

    let meshColors: Float32Array | undefined;
    if (styles.length > 0 && models.mesh && models.mesh.ids) {
        meshColors = applyStyle(styles, baseColor, models.mesh.ids, metadata);
    }

    postMessage({
        jobID: jobID,
        result: {
            metadata: metadata,
            mesh: {
                positions: models.mesh?.positions,
                ids: models.mesh?.ids,
                normals: models.mesh?.normals,
                colors: meshColors,
            },
            points: {
                positions: models.point?.positions,
                ids: models.point?.ids,
            },
        }
    });

}




