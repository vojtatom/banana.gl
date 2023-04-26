import { vec3 } from 'gl-matrix';

import { Renderable } from '@bananagl/models/renderable';

import { Ray } from './ray';

export interface BVH {
    trace(ray: Ray): { t: number; index: number };
    pointsInDistance(point: vec3, dist: number): number[];
}
