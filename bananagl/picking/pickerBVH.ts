import { mat4 } from 'gl-matrix';

import { Pickable } from '@bananagl/models/pickable';

import { BVH } from './bvh';
import { Ray } from './ray';

const inverseTransform = mat4.create();

export class PickerBVH {
    private objects: Pickable[] = [];

    add(renderable: Pickable) {
        if (!renderable.BVH) return;
        this.objects.push(renderable);
    }

    trace(ray: Ray) {
        let bestT = Infinity,
            bestObjectIndex = -1,
            bestPrimitiveIndex = -1;
        for (let objectIndex = 0; objectIndex < this.objects.length; objectIndex++) {
            const object = this.objects[objectIndex];
            const bvh = object.BVH as BVH;

            ray.transform(mat4.invert(inverseTransform, object.transform));

            const hit = bvh.trace(ray);
            if (hit.t < bestT) {
                bestT = hit.t;
                bestObjectIndex = objectIndex;
                bestPrimitiveIndex = hit.index;
            }
            ray.untransform();
        }

        if (bestObjectIndex === -1) return null;

        const object = this.objects[bestObjectIndex];
        return {
            object,
            primitiveIndex: bestPrimitiveIndex,
            t: bestT,
        };
    }
}
