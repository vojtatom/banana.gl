import { mat4, vec3 } from 'gl-matrix';

import { Pickable } from '@bananagl/models/pickable';
import { Scene } from '@bananagl/scene/scene';

import { BVH } from './bvh';
import { Ray } from './ray';

const inverseTransform = mat4.create();
const intersectionPoint = vec3.create();

export class PickerBVH {
    constructor(private readonly scene: Scene) {}

    trace(ray: Ray) {
        const objects = this.scene.objects;

        let bestT = Infinity,
            bestObjectIndex = -1,
            bestPrimitiveIndex = -1;

        for (let objectIndex = 0; objectIndex < objects.length; objectIndex++) {
            const object = objects[objectIndex];
            if (!(object instanceof Pickable)) continue;
            const bvh = object.BVH as BVH;

            //to object space
            ray.transform(mat4.invert(inverseTransform, object.transform));

            const hit = bvh.trace(ray);
            if (!hit) continue;

            //back to the world space
            vec3.add(
                intersectionPoint,
                ray.origin,
                vec3.scale(intersectionPoint, ray.direction, hit.t)
            );
            ray.untransform();
            vec3.transformMat4(intersectionPoint, intersectionPoint, object.transform);
            hit.t = vec3.distance(ray.origin, intersectionPoint);

            if (hit.t < bestT) {
                bestT = hit.t;
                bestObjectIndex = objectIndex;
                bestPrimitiveIndex = hit.index;
            }
        }

        if (bestObjectIndex === -1) return null;

        const object = objects[bestObjectIndex];
        return {
            object,
            primitiveIndex: bestPrimitiveIndex,
            t: bestT,
        };
    }
}
