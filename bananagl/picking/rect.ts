import { mat4, vec2, vec3 } from 'gl-matrix';

import { Camera } from '@bananagl/camera/camera';
import { TypedArray } from '@bananagl/shaders/shader';

import { Ray, transformMat4ZeroW } from './ray';

class Plane {
    private tmp: vec3 = vec3.create();

    private origin_ = vec3.create();
    private normal_ = vec3.create();

    constructor(private normal: vec3, private origin: vec3) {}
    static fromTwoRays(ray1: Ray, ray2: Ray) {
        const crossDir = vec3.add(vec3.create(), ray1.origin, ray1.direction);
        vec3.normalize(crossDir, vec3.sub(crossDir, crossDir, ray2.origin));
        const normal = vec3.cross(vec3.create(), crossDir, ray2.direction);
        return new Plane(normal, ray1.origin);
    }

    sign(point: vec3) {
        return vec3.dot(
            this.normal,
            vec3.normalize(this.tmp, vec3.sub(this.tmp, point, this.origin))
        );
    }

    signedDistance(point: vec3) {
        return vec3.dot(this.normal, vec3.sub(this.tmp, point, this.origin));
    }

    transform(m: mat4) {
        vec3.copy(this.origin_, this.origin);
        vec3.copy(this.normal_, this.normal);
        vec3.transformMat4(this.origin, this.origin, m);
        transformMat4ZeroW(this.normal, this.normal, m);
        vec3.normalize(this.normal, this.normal);
    }

    untransform() {
        vec3.copy(this.origin, this.origin_);
        vec3.copy(this.normal, this.normal_);
    }
}

export class RectSelector {
    left: Plane;
    top: Plane;
    right: Plane;
    bottom: Plane;
    near: Plane;
    far: Plane;

    constructor(camera: Camera, from: vec2, to: vec2) {
        const xmin = Math.min(from[0], to[0]);
        const xmax = Math.max(from[0], to[0]);
        const ymin = Math.min(from[1], to[1]);
        const ymax = Math.max(from[1], to[1]);

        const bl = camera.primaryRay(xmin, ymin);
        const tl = camera.primaryRay(xmin, ymax);
        const br = camera.primaryRay(xmax, ymin);
        const tr = camera.primaryRay(xmax, ymax);

        const dir = vec3.create();
        vec3.normalize(dir, vec3.sub(dir, camera.target, camera.position));
        const negatedDir = vec3.negate(vec3.create(), dir);
        const farPoint = vec3.scaleAndAdd(vec3.create(), camera.position, dir, camera.far);
        const nearPoint = vec3.scaleAndAdd(vec3.create(), camera.position, dir, camera.near);

        this.left = Plane.fromTwoRays(bl, tl);
        this.top = Plane.fromTwoRays(tl, tr);
        this.right = Plane.fromTwoRays(tr, br);
        this.bottom = Plane.fromTwoRays(br, bl);
        this.far = new Plane(negatedDir, farPoint);
        this.near = new Plane(dir, nearPoint);
    }

    transform(matrix: mat4) {
        this.left.transform(matrix);
        this.top.transform(matrix);
        this.right.transform(matrix);
        this.bottom.transform(matrix);
        this.far.transform(matrix);
        this.near.transform(matrix);
    }

    untransform() {
        this.left.untransform();
        this.top.untransform();
        this.right.untransform();
        this.bottom.untransform();
        this.far.untransform();
        this.near.untransform();
    }

    boxInsideFrustum(min: vec3, max: vec3) {
        const points = [
            vec3.fromValues(min[0], min[1], min[2]),
            vec3.fromValues(min[0], min[1], max[2]),
            vec3.fromValues(min[0], max[1], min[2]),
            vec3.fromValues(min[0], max[1], max[2]),
            vec3.fromValues(max[0], min[1], min[2]),
            vec3.fromValues(max[0], min[1], max[2]),
            vec3.fromValues(max[0], max[1], min[2]),
            vec3.fromValues(max[0], max[1], max[2]),
        ];

        if (points.map((p) => this.left.sign(p)).every((s) => s < 0)) return false;
        if (points.map((p) => this.top.sign(p)).every((s) => s < 0)) return false;
        if (points.map((p) => this.right.sign(p)).every((s) => s < 0)) return false;
        if (points.map((p) => this.bottom.sign(p)).every((s) => s < 0)) return false;
        if (points.map((p) => this.far.sign(p)).every((s) => s < 0)) return false;
        if (points.map((p) => this.near.sign(p)).every((s) => s < 0)) return false;

        return true;
    }

    triangleInsideFrustum(data: TypedArray, triIndex: number) {
        const index = triIndex * 9;
        const a = vec3.fromValues(data[index], data[index + 1], data[index + 2]);
        const b = vec3.fromValues(data[index + 3], data[index + 4], data[index + 5]);
        const c = vec3.fromValues(data[index + 6], data[index + 7], data[index + 8]);

        if (this.left.sign(a) < 0 || this.left.sign(b) < 0 || this.left.sign(c) < 0) return false;
        if (this.top.sign(a) < 0 || this.top.sign(b) < 0 || this.top.sign(c) < 0) return false;
        if (this.right.sign(a) < 0 || this.right.sign(b) < 0 || this.right.sign(c) < 0)
            return false;
        if (this.bottom.sign(a) < 0 || this.bottom.sign(b) < 0 || this.bottom.sign(c) < 0)
            return false;
        if (this.far.sign(a) < 0 || this.far.sign(b) < 0 || this.far.sign(c) < 0) return false;
        if (this.near.sign(a) < 0 || this.near.sign(b) < 0 || this.near.sign(c) < 0) return false;

        return true;
    }
}
