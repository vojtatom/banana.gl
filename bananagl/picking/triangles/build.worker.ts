import { Attribute } from '@bananagl/models/attribute';
import { Buffer } from '@bananagl/models/buffer';

import { TriangleBVHBuilder } from './builder';
import { BuilderOutput, TriangleBuildInput, getTrasferables, toTransferable } from './transform';

self.onmessage = (e) => {
    const data = e.data as TriangleBuildInput;
    const { position, attrs } = toAttributes(data);
    const builder = new TriangleBVHBuilder(position, attrs);
    const returnedAttrs = toTransferable(position, attrs);
    const transferables = getTrasferables(returnedAttrs);
    const result: BuilderOutput = {
        data: returnedAttrs,
        rootNode: builder.root,
    };
    (self as any).postMessage(result, transferables);
};

function toAttributes(data: TriangleBuildInput) {
    return {
        position: new Attribute(
            data.position.name,
            new Buffer(data.position.buffer.data),
            data.position.size,
            data.position.normalized,
            data.position.stride,
            data.position.offset
        ),
        attrs: data.attrs.map(
            (a) =>
                new Attribute(
                    a.name,
                    new Buffer(a.buffer.data),
                    a.size,
                    a.normalized,
                    a.stride,
                    a.offset
                )
        ),
    };
}
