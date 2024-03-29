import { Attribute } from '@bananagl/models/attribute';

import { BBox } from '../bbox';
import { BVHNode } from '../bvh';

const TRIANGLES_PER_LEAF = 100;
const SIZE_PERCT = 0.1;

export class TriangleBVHBuilder {
    readonly root: BVHNode;

    constructor(private position: Attribute, private attr: Attribute[]) {
        const bbox = new BBox();
        const parray = position.buffer.data;
        bbox.extendArr(parray, 0, parray.length);
        this.root = this.build(0, position.count / 9, bbox);
    }

    build(from: number, to: number, bbox: BBox) {
        const size = to - from;
        if (size <= TRIANGLES_PER_LEAF) return this.createLeaf(from, to, bbox);
        else return this.buildTwoSubtrees(from, to, bbox);
    }

    buildTwoSubtrees(from: number, to: number, bbox: BBox) {
        const axis = bbox.longestDim();
        const split = bbox.midpoint(axis);

        const { firstRight, center, left, right } = this.classify(from, to, axis, split);

        if (firstRight === from || firstRight === to) {
            return this.allOnOneSideCase(from, to, bbox, center);
        }

        const leftNode = this.build(from, firstRight, left);
        const rightNode = this.build(firstRight, to, right);
        const node: BVHNode = { bbox, left: leftNode, right: rightNode };
        return node;
    }

    private allOnOneSideCase(from: number, to: number, bbox: BBox, center: number) {
        const lens = new Float32Array(to - from);
        const axis = bbox.longestDim();
        const max = this.computeLengths(from, to, lens, axis);
        const count = this.countBiggerThanHalf(lens, max);

        //console.log(`${count} out of ${to - from}`);
        if (count < SIZE_PERCT * (to - from))
            return this.largeTrianglesStrategy(from, to, bbox, lens);
        else return this.medianSpatialSplitStrategy(from, to, bbox, center);
    }

    private largeTrianglesStrategy(from: number, to: number, bbox: BBox, lensPerct: Float32Array) {
        //console.log('Using large triangles strategy');

        const { firstRight, left, right } = this.classifyLargeTriangles(from, to, lensPerct);

        if (firstRight === from || firstRight === to) {
            console.warn(`Fail in large triangles strategy, creating leaf with size ${to - from}`);
            return this.createLeaf(from, to, bbox);
        }

        const leftNode = this.build(from, firstRight, left);
        const rightNode = this.build(firstRight, to, right);
        const node: BVHNode = { bbox, left: leftNode, right: rightNode };
        return node;
    }

    private medianSpatialSplitStrategy(from: number, to: number, bbox: BBox, center: number) {
        //console.log('Using median spatial split strategy');
        const axis = bbox.longestDim();
        const { firstRight, left, right } = this.classify(from, to, axis, center);

        if (firstRight === from || firstRight === to) {
            console.warn(
                `Fail in median spatial split strategy, creating leaf with size ${to - from}`
            );
            return this.createLeaf(from, to, bbox);
        }

        const leftNode = this.build(from, firstRight, left);
        const rightNode = this.build(firstRight, to, right);
        const node: BVHNode = { bbox, left: leftNode, right: rightNode };
        return node;
    }

    private createLeaf(from: number, to: number, bbox: BBox) {
        //console.log('leaf size', to - from);
        return {
            bbox,
            from,
            to,
        } as BVHNode;
    }

    //--------------------------------------------------------------------------------

    private classify(from: number, to: number, axis: number, split: number) {
        let iFirstRight = from,
            iVertexFirstRight,
            iVertex,
            iBuffer,
            midpoint;
        const pbuffer = this.position.buffer.data;
        const position = this.position;
        const attr = this.attr;
        const left = new BBox(),
            right = new BBox();
        let center = 0;

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
            center += midpoint;

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
        return {
            firstRight: iFirstRight,
            center: center / (to - from),
            left,
            right,
        };
    }

    private classifyLargeTriangles(from: number, to: number, lensPerct: Float32Array) {
        let iFirstRight = from,
            iVertexFirstRight,
            iVertex,
            iBuffer,
            len;
        const position = this.position;
        const attr = this.attr;
        const pbuffer = position.buffer.data;
        const left = new BBox(),
            right = new BBox();

        for (let i = from; i < to; i++) {
            //init indices
            iVertex = i * 3;
            iBuffer = iVertex * 3;
            iVertexFirstRight = iFirstRight * 3;

            //compute len of triangle
            len = lensPerct[i - from];

            //classify
            if (len > 0.5) {
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
        return {
            firstRight: iFirstRight,
            left,
            right,
        };
    }

    //--------------------------------------------------------------------------------

    private computeLengths(from: number, to: number, lens: Float32Array, axis: number) {
        const pbuffer = this.position.buffer.data;
        let len,
            max = 0;
        for (let i = from; i < to; i++) {
            const iVertex = i * 3;
            const iBuffer = iVertex * 3;
            len =
                Math.max(
                    pbuffer[iBuffer + axis],
                    pbuffer[iBuffer + 3 + axis],
                    pbuffer[iBuffer + 6 + axis]
                ) -
                Math.min(
                    pbuffer[iBuffer + axis],
                    pbuffer[iBuffer + 3 + axis],
                    pbuffer[iBuffer + 6 + axis]
                );

            lens[i - from] = len;
            if (len > max) max = len;
        }

        return max;
    }

    private countBiggerThanHalf(lens: Float32Array, max: number) {
        let countBiggerThanHalf = 0;
        for (let i = 0; i < lens.length; i++) {
            lens[i] /= max;
            if (lens[i] > 0.5) countBiggerThanHalf++;
        }
        return countBiggerThanHalf;
    }

    //--------------------------------------------------------------------------------

    validate() {
        console.log('validating');
        if (!this.root) throw new Error('no root');
        const triangles = new Uint8Array(this.position.count / 9).fill(0);
        this.validateNode(this.root, triangles);
        triangles.some((t) => {
            if (!t) throw new Error('triangle not found');
        });
        console.log('validation ok');
    }

    private validateNode(node: BVHNode, triangles: Uint8Array, depth: number = 0) {
        if (!node.bbox) throw new Error('no bbox');

        if ((node.from === undefined || node.to === undefined) && (!node.left || !node.right))
            throw new Error('invalid node');

        if (node.left) {
            if (!node.bbox.contains(node.left.bbox)) {
                console.error(node.bbox, node.left.bbox, depth);
                throw new Error('invalid bbox left');
            }
        }

        if (node.right) {
            if (!node.bbox.contains(node.right.bbox)) {
                console.error(node.bbox, node.right.bbox, depth);
                throw new Error('invalid bbox');
            }
        }

        if (node.left && node.right) {
            this.validateNode(node.left, triangles, depth + 1);
            this.validateNode(node.right, triangles, depth + 1);
        } else {
            if (node.from === undefined || node.to === undefined) throw new Error('invalid node');
            for (let i = node.from; i < node.to; i++) {
                if (triangles[i]) throw new Error('triangle already used');
                triangles[i] = 1;
            }
        }
    }
}
