import { Renderable } from '@bananagl/models/renderable';

import { Ray } from './ray';

export interface BVH {
    intersectionCounter: number;
    trace(ray: Ray): { t: number; index: number };
}
