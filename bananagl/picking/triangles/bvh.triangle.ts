import { vec3 } from 'gl-matrix';

import { Attribute } from '@bananagl/models/attribute';
import { Renderable } from '@bananagl/models/renderable';

import { BVH, BVHNode } from '../bvh';
import { Ray } from '../ray';
import { RectSelector } from '../rect';
import { buildBVHInWorker } from './build';

export class TriangleBVH implements BVH {
    private root?: BVHNode;
    private position: Attribute;
    private attr: Attribute[];

    constructor(model: Renderable) {
        if (model.attributes.isIndexed) throw new Error('Cannot use indexed geometry inside BVH.');
        if (model.attributes.isInstanced)
            throw new Error('Cannot use instanced geometry inside BVH.');

        const position = model.attributes.getAttribute('position') as Attribute;

        if (!position) throw new Error('Cannot find position attribute in model.');
        if (position.stride > 0 || position.offset > 0)
            throw new Error('Interleaved or offseted position attribute is not supported.');

        this.position = position;

        const attr = model.attributes.rawAttributes.filter(
            (a) => a.name !== 'position'
        ) as Attribute[];
        this.attr = attr;
    }

    async build() {
        const data = await buildBVHInWorker(this.position, this.attr);
        this.root = data;
    }

    //--------------------------------------------------------------------------------

    trace(ray: Ray) {
        let bestT = Infinity;
        let bestIndex = -1;
        let boxT = Infinity;
        let hit: [number, number] = [Infinity, -1]; //t, index

        if (!this.root) return { t: bestT, index: bestIndex };

        const stack = new Array<BVHNode>();
        stack.push(this.root);

        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) continue;
            if (node.bbox) {
                boxT = ray.intersectBox(node.bbox.min, node.bbox.max);
                if (boxT >= bestT) continue;

                if (node.left) stack.push(node.left);
                if (node.right) stack.push(node.right);

                if (node.from !== undefined) {
                    this.traverseLeaf(node, ray, hit);
                    if (hit[0] < bestT) (bestT = hit[0]), (bestIndex = hit[1]);
                }
            }
        }

        return {
            t: bestT,
            index: bestIndex,
        };
    }

    private traverseLeaf(node: BVHNode, ray: Ray, bestHit: [number, number]) {
        let bestT = Infinity,
            bestIndex = -1,
            hit: number;
        for (let i = node.from!; i < node.to!; i++) {
            hit = ray.intersectTriangle(this.position.buffer.data, i);
            if (hit < bestT) {
                bestT = hit;
                bestIndex = i;
            }
        }

        bestHit[0] = bestT;
        bestHit[1] = bestIndex;
    }

    //--------------------------------------------------------------------------------
    pointsInDistance(point: vec3, dist: number) {
        if (!this.root) return [];

        const stack = new Array<BVHNode>();
        stack.push(this.root);
        let boxT = Infinity;
        let distSqrt = dist * dist;

        const pointIndices: number[] = [];

        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) continue;
            if (node.bbox) {
                boxT = node.bbox.distanceTo(point);
                if (boxT >= dist) continue;

                if (node.left) stack.push(node.left);
                if (node.right) stack.push(node.right);

                if (node.from !== undefined) {
                    this.traverseLeafPoints(node, point, pointIndices, distSqrt);
                }
            }
        }

        return pointIndices;
    }

    private traverseLeafPoints(
        node: BVHNode,
        point: vec3,
        pointIndices: number[],
        distSqrt: number
    ) {
        for (let i = node.from!; i < node.to!; i++) {
            for (let j = 0; j < 3; j++) {
                const iVertex = i * 3 + j;
                const p = this.position.buffer.data.subarray(iVertex * 3, iVertex * 3 + 3) as vec3;
                if (vec3.sqrDist(p, point) < distSqrt) pointIndices.push(iVertex * 3);
            }
        }
    }
    //--------------------------------------------------------------------------------
    traceRect(rect: RectSelector) {
        if (!this.root) return [];

        const stack = new Array<BVHNode>();
        stack.push(this.root);

        const indices: number[] = [];

        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) continue;
            if (node.bbox) {
                if (!rect.boxInsideFrustum(node.bbox.min, node.bbox.max)) continue;

                if (node.left) stack.push(node.left);
                if (node.right) stack.push(node.right);

                if (node.from !== undefined) {
                    this.traverseLeafRect(node, rect, indices);
                }
            }
        }

        return indices;
    }

    private traverseLeafRect(node: BVHNode, rect: RectSelector, indices: number[]) {
        let hit;
        for (let i = node.from!; i < node.to!; i++) {
            hit = rect.triangleInsideFrustum(this.position.buffer.data, i);
            if (hit) indices.push(i);
        }
    }
}
