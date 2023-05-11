import { vec3 } from 'gl-matrix';

import { BBox } from './bbox';
import { Ray } from './ray';

export interface BVH {
    trace(ray: Ray): { t: number; index: number };
    pointsInDistance(point: vec3, dist: number): number[];
}

export interface BVHNode {
    bbox: BBox;
    left?: BVHNode;
    right?: BVHNode;
    from?: number;
    to?: number;
}
