import { TypedArray } from '@bananagl/shaders/shader';

import { Attribute } from '@bananagl/bananagl';

import { BBox } from '../bbox';
import { BVHNode } from '../bvh';

interface BufferData {
    data: TypedArray;
}

interface AttributeData {
    name: string;
    buffer: BufferData;
    size: number;
    normalized: boolean;
    stride: number;
    offset: number;
}

export interface TriangleBuildInput {
    position: AttributeData;
    attrs: AttributeData[];
}

export interface BuilderOutput {
    data: TriangleBuildInput;
    rootNode: BVHNode;
}

export function toTransferable(position: Attribute, attr: Attribute[]) {
    const data: TriangleBuildInput = {
        position: {
            name: position.name,
            buffer: {
                data: position.buffer.data,
            },
            size: position.size,
            normalized: position.normalized,
            stride: position.stride,
            offset: position.offset,
        },
        attrs: attr.map((a) => ({
            name: a.name,
            buffer: {
                data: a.buffer.data,
            },
            size: a.size,
            normalized: a.normalized,
            stride: a.stride,
            offset: a.offset,
        })),
    };

    return data;
}

export function getTrasferables(data: TriangleBuildInput) {
    return [data.position.buffer.data.buffer, ...data.attrs.map((a) => a.buffer.data.buffer)];
}

export function fromTransferable(position: Attribute, attr: Attribute[], data: TriangleBuildInput) {
    position.buffer.data = data.position.buffer.data;
    attr.forEach((a, i) => {
        a.buffer.data = data.attrs[i].buffer.data;
    });
}

export function reconstructBBoxes(node: BVHNode) {
    const bbox = new BBox();
    bbox.min = node.bbox.min;
    bbox.max = node.bbox.max;
    node.bbox = bbox;
    if (node.left) reconstructBBoxes(node.left);
    if (node.right) reconstructBBoxes(node.right);
}
