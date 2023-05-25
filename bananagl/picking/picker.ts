import { mat4, vec3 } from 'gl-matrix';

import { Pickable } from '@bananagl/models/pickable';
import { Scene } from '@bananagl/scene/scene';

import { Ray } from './ray';
import { RectSelector } from './rect';

const inverseTransform = mat4.create();
const intersectionPoint = vec3.create();

export class Picker {
    constructor(private readonly scene: Scene) {}

    trace(ray: Ray) {
        const objects = this.scene.objects;

        let bestT = Infinity,
            bestObjectIndex = -1,
            bestPrimitiveIndex = -1;

        for (let objectIndex = 0; objectIndex < objects.length; objectIndex++) {
            const object = objects[objectIndex];

            if (!(object instanceof Pickable)) continue;
            if (!object.visible) continue;

            const hit = this.traceObject(ray, object);
            if (!hit) continue;

            if (hit.t < bestT) {
                bestT = hit.t;
                bestObjectIndex = objectIndex;
                bestPrimitiveIndex = hit.index;
            }
        }

        if (bestObjectIndex === -1) return null;

        const object = objects[bestObjectIndex];
        return {
            object: object as Pickable,
            primitiveIndices: bestPrimitiveIndex,
        };
    }

    traceRect(rect: RectSelector) {
        const objects = this.scene.objects;

        for (let objectIndex = 0; objectIndex < objects.length; objectIndex++) {
            const object = objects[objectIndex];

            if (!(object instanceof Pickable)) continue;
            if (!object.visible) continue;

            const bvh = object.BVH;
            if (!bvh) return null;

            rect.transform(mat4.invert(inverseTransform, object.transform));

            const hits = bvh.traceRect(rect);
            if (hits.length > 0)
                return {
                    object: object as Pickable,
                    primitiveIndices: hits,
                };

            rect.untransform();
        }
        return null;
    }

    private traceObject(ray: Ray, object: Pickable) {
        const bvh = object.BVH;
        if (!bvh) return null;

        //to object space
        ray.transform(mat4.invert(inverseTransform, object.transform));

        const hit = bvh.trace(ray);
        if (!hit) return null;

        //back to the world space
        vec3.add(
            intersectionPoint,
            ray.origin,
            vec3.scale(intersectionPoint, ray.direction, hit.t)
        );
        ray.untransform();
        vec3.transformMat4(intersectionPoint, intersectionPoint, object.transform);
        hit.t = vec3.distance(ray.origin, intersectionPoint);
        return hit;
    }
}
