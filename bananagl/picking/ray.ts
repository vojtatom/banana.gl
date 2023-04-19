import { mat4, vec3 } from 'gl-matrix';

import { TypedArray } from '@bananagl/shaders/shader';

const ab = vec3.create();
const ac = vec3.create();
const pvec = vec3.create();
const qvec = vec3.create();
const ao = vec3.create();
const invDir = vec3.create();

export function transformMat4ZeroW(out: vec3, a: vec3, m: mat4) {
    const x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z;
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
}

export class Ray {
    origin: vec3;
    direction: vec3;

    constructor(origin?: vec3, direction?: vec3) {
        this.origin = origin || vec3.create();
        this.direction = direction || vec3.create();
    }

    intersectTriangle(data: TypedArray, triIndex: number): number {
        const index = triIndex * 9;
        const a = vec3.fromValues(data[index], data[index + 1], data[index + 2]);
        const b = vec3.fromValues(data[index + 3], data[index + 4], data[index + 5]);
        const c = vec3.fromValues(data[index + 6], data[index + 7], data[index + 8]);

        vec3.sub(ab, b, a);
        vec3.sub(ac, c, a);
        vec3.cross(pvec, this.direction, ac);
        const d = vec3.dot(ab, pvec);

        if (Math.abs(d) < 1e-6) return Infinity;

        const dinv = 1 / d;

        //first barycentric coordinate
        vec3.sub(ao, this.origin, a);
        const u = vec3.dot(ao, pvec) * dinv;

        if (u < 0 || u > 1) return Infinity;

        //second barycentric coordinate
        vec3.cross(qvec, ao, ab);
        const v = vec3.dot(this.direction, qvec) * dinv;

        if (v < 0 || u + v > 1) return Infinity;

        const t = vec3.dot(ac, qvec) * dinv;

        if (t < 0) return Infinity;

        return t;
    }

    intersectBox(min: vec3, max: vec3) {
        let tmin, tmax;
        vec3.set(invDir, 1 / this.direction[0], 1 / this.direction[1], 1 / this.direction[2]);
        const origin = this.origin;
        let tmp;

        tmin = (min[0] - origin[0]) * invDir[0];
        tmax = (max[0] - origin[0]) * invDir[0];

        if (tmin > tmax) {
            tmp = tmin;
            tmin = tmax;
            tmax = tmp;
        }

        let tymin, tymax;

        tymin = (min[1] - origin[1]) * invDir[1];
        tymax = (max[1] - origin[1]) * invDir[1];

        if (tymin > tymax) {
            tmp = tymin;
            tymin = tymax;
            tymax = tmp;
        }

        if (tmax < tymin || tmin > tymax) return Infinity;
        if (tymax < tmax) tmax = tymax;
        if (tmin < tymin) tmin = tymin;

        let tzmin, tzmax;

        tzmin = (min[2] - origin[2]) * invDir[2];
        tzmax = (max[2] - origin[2]) * invDir[2];

        if (tzmin > tzmax) {
            tmp = tzmin;
            tzmin = tzmax;
            tzmax = tmp;
        }

        if (tmax < tzmin || tmin > tzmax) return Infinity;
        if (tzmax < tmax) tmax = tzmax;
        if (tmin < tzmin) tmin = tzmin;

        return tmin;
    }

    private origin_ = vec3.create();
    private direction_ = vec3.create();

    transform(matrix: mat4) {
        vec3.copy(this.origin_, this.origin);
        vec3.copy(this.direction_, this.direction);
        vec3.transformMat4(this.origin, this.origin, matrix);
        transformMat4ZeroW(this.direction, this.direction, matrix);
        vec3.normalize(this.direction, this.direction);
    }

    untransform() {
        vec3.copy(this.origin, this.origin_);
        vec3.copy(this.direction, this.direction_);
    }
}
