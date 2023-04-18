import { Attribute } from '@bananagl/models/attribute';
import { Renderable } from '@bananagl/models/renderable';

import { BBox } from './bbox';

interface BVHInternalNode {
    bbox: BBox;
    left: BVHInternalNode | BVHLeafNode;
    right: BVHInternalNode | BVHLeafNode;
}

interface BVHLeafNode {
    bbox: BBox;
    from: number;
    to: number;
}

const TRIANGLES_PER_LEAF = 100;

export class TriangleBVH {
    root?: BVHInternalNode | BVHLeafNode;

    constructor(model: Renderable) {
        if (model.attributes.isIndexed) throw new Error('Cannot use indexed geometry inside BVH.');
        if (model.attributes.isInstanced)
            throw new Error('Cannot use instanced geometry inside BVH.');

        const position = model.attributes.getAttribute('position') as Attribute;
        if (!position) throw new Error('Cannot find position attribute in model.');

        const attr = model.attributes.rawAttributes.filter(
            (a) => a.name !== 'position'
        ) as Attribute[];

        const bbox = new BBox();
        const parray = position.buffer.data;
        bbox.extendArr(parray, 0, parray.length);
        this.root = this.build(position, attr, 0, position.count / 9, bbox);
    }

    build(position: Attribute, attr: Attribute[], from: number, to: number, bbox: BBox) {
        const size = to - from;
        if (size <= TRIANGLES_PER_LEAF) return this.createLeaf(from, to, bbox);
        else return this.buildTwoSubtrees(position, attr, from, to, bbox);
    }

    buildTwoSubtrees(position: Attribute, attr: Attribute[], from: number, to: number, bbox: BBox) {
        const axis = bbox.longestDim();
        const split = bbox.midpoint(axis);
        const left = new BBox(),
            right = new BBox();

        const firstRight = this.classify(left, right, from, to, position, attr, axis, split);

        //TODO what if all of the triangles fall into the second cat?

        if (firstRight === from || firstRight === to) {
            //TODO remove triangle that does not fit
            return this.createLeaf(from, to, bbox);
        }

        const leftNode = this.build(position, attr, from, firstRight, left);
        const rightNode = this.build(position, attr, firstRight, to, right);
        const node: BVHInternalNode = { bbox, left: leftNode, right: rightNode };
        return node;
    }

    private classify(
        left: BBox,
        right: BBox,
        from: number,
        to: number,
        position: Attribute,
        attr: Attribute[],
        axis: number,
        split: number
    ) {
        let iFirstRight = from,
            iVertexFirstRight,
            iVertex,
            iBuffer,
            midpoint;
        const pbuffer = position.buffer.data;

        for (let i = from; i < to; i++) {
            //init indices
            iVertex = i * 3;
            iBuffer = iVertex * 3;
            iVertexFirstRight = iFirstRight * 3;

            //compute midpoint of triangle
            midpoint =
                (pbuffer[iBuffer + axis] +
                    pbuffer[iBuffer + 3 + axis] +
                    pbuffer[iBuffer + 6 + axis]) /
                3;

            //classify
            if (midpoint >= split) {
                right.extendArr(pbuffer, iBuffer, iBuffer + 9);
            } else {
                left.extendArr(pbuffer, iBuffer, iBuffer + 9);
                position.swap(iVertex, iVertexFirstRight);
                position.swap(iVertex + 1, iVertexFirstRight + 1);
                position.swap(iVertex + 2, iVertexFirstRight + 2);
                for (let j = 0; j < attr.length; j++) {
                    attr[j].swap(iVertex, iVertexFirstRight);
                    attr[j].swap(iVertex + 1, iVertexFirstRight + 1);
                    attr[j].swap(iVertex + 2, iVertexFirstRight + 2);
                }
                iFirstRight++;
            }
        }
        return iFirstRight;
    }

    private createLeaf(from: number, to: number, bbox: BBox) {
        console.log('leaf size', to - from);
        return {
            bbox,
            from,
            to,
        } as BVHLeafNode;
    }
}
