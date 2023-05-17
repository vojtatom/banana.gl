import { Attribute } from '@bananagl/bananagl';

import { BVHNode } from '../bvh';
import BuilderWorker from './build.worker?worker&inline';
import {
    BuilderOutput,
    fromTransferable,
    getTrasferables,
    reconstructBBoxes,
    toTransferable,
} from './transform';

export async function buildBVHInWorker(position: Attribute, attr: Attribute[]) {
    const data = toTransferable(position, attr);
    const transferables = getTrasferables(data);
    return new Promise<BVHNode>((resolve) => {
        const worker = new BuilderWorker();
        worker.onmessage = (e) => {
            const data = e.data as BuilderOutput;
            fromTransferable(position, attr, data.data);
            reconstructBBoxes(data.rootNode);
            resolve(data.rootNode);
            worker.terminate();
        };
        worker.postMessage(data, transferables);
    });
}
