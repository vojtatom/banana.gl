import { mat4, quat, vec2, vec3, vec4 } from 'gl-matrix';

import { UniformValue } from '@3D/shaders/shader';

export enum ProjectionType {
    PERSPECTIVE,
    ORTHOGRAPHIC,
}

function unproject(out: vec3, source: vec3, modelViewProjectionInverse: mat4): vec3 {
    vec3.transformMat4(out, source, modelViewProjectionInverse);
    return out;
}

export interface CameraOptions {
    position?: vec3;
    target?: vec3;
    up?: vec3;
    projectionType?: ProjectionType;
    fovYRadian?: number;
    width?: number;
    height?: number;
    near?: number;
    far?: number;
}

export class Camera {
    position: vec3;
    target: vec3;
    up: vec3;
    type: ProjectionType;
    fovYRadian: number;
    aspectRatio: number;
    near: number;
    far: number;
    projectionMatrix: mat4 = mat4.create();
    viewProjectionInverse: mat4 = mat4.create();
    viewMatrix: mat4 = mat4.create();
    projectionViewMatrix: mat4 = mat4.create();
    private direction: vec3 = vec3.create();
    private uniforms_: { [uniform: string]: UniformValue } = {};
    private width: number = 0;
    private height: number = 0;
    private maxangle: number = Math.PI / 2;
    private minangle: number = 0.01;

    private left: number = 0;
    private right: number = 0;
    private bottom: number = 0;
    private top: number = 0;

    get uniforms() {
        return this.uniforms_;
    }

    constructor(options: CameraOptions = {}) {
        this.position = options.position ?? vec3.fromValues(50, 50, 50);
        this.target = options.target ?? vec3.fromValues(0, 0, 0);
        this.up = options.up ?? vec3.fromValues(0, 0, 1);
        this.type = options.projectionType ?? ProjectionType.PERSPECTIVE;
        this.fovYRadian = options.fovYRadian ?? Math.PI / 4;
        this.width = options.width ?? 1;
        this.height = options.height ?? 1;
        this.aspectRatio = this.width / this.height;
        this.near = options.near ?? 1;
        this.far = options.far ?? 1000;
        this.uniforms_['uCameraPosition'] = this.position;
        this.uniforms_['uCameraTarget'] = this.target;
        this.uniforms_['uCameraUp'] = this.up;
        this.uniforms_['uProjectionMatrix'] = this.projectionMatrix;
        this.uniforms_['uViewMatrix'] = this.viewMatrix;
        this.uniforms_['uProjectionViewMatrix'] = this.projectionViewMatrix;
        this.updateOrthoBounds();
        this.updateMatrices();
    }

    updateOrthoBounds() {
        this.left = this.width / -2;
        this.right = this.width / 2;
        this.bottom = this.height / -2;
        this.top = this.height / 2;
    }

    set(options: CameraOptions) {
        if (options.position) this.position = options.position;
        if (options.target) this.target = options.target;
        if (options.up) this.up = options.up;
        if (options.projectionType) this.projectionType = options.projectionType;
        if (options.fovYRadian) this.fovYRadian = options.fovYRadian;
        if (options.width) this.width = options.width;
        if (options.height) this.height = options.height;
        this.aspectRatio = this.width / this.height;
        if (options.near) this.near = options.near;
        if (options.far) this.far = options.far;
        this.updateOrthoBounds();
        this.updateMatrices();
    }

    private getFrustrumWidthAtTarget(): number {
        const distance = vec3.dist(this.position, this.target);
        return 2 * distance * Math.tan(this.fovYRadian / 2);
    }

    private getFrustumHeightAtTarget(): number {
        return this.getFrustrumWidthAtTarget() / this.aspectRatio;
    }

    private updatePositionForProjectionType(): void {
        const direction = this.direction;
        vec3.sub(direction, this.target, this.position);
        vec3.normalize(direction, direction);

        const distance = this.getFrustumHeightAtTarget() / (2 * Math.tan(this.fovYRadian / 2));

        if (this.projectionType === ProjectionType.PERSPECTIVE) {
            vec3.scale(direction, direction, distance);
            vec3.sub(this.position, this.target, direction);
        } else {
            vec3.scale(direction, direction, this.near + (this.far - this.near) / 2);
            vec3.sub(this.position, this.target, direction);
        }
    }

    get dir() {
        const direction = this.direction;
        vec3.sub(direction, this.position, this.target);
        vec3.normalize(direction, direction);
        return direction;
    }

    private updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    private updateProjectionMatrix() {
        if (this.projectionType === ProjectionType.PERSPECTIVE) {
            mat4.perspective(
                this.projectionMatrix,
                this.fovYRadian,
                this.aspectRatio,
                this.near,
                this.far
            );
        } else {
            const height = this.getFrustumHeightAtTarget();
            const width = height * this.aspectRatio;
            mat4.ortho(
                this.projectionMatrix,
                this.left,
                this.right,
                this.bottom,
                this.top,
                this.near,
                this.far
            );
        }
    }

    set projectionType(projectionType: ProjectionType) {
        this.type = projectionType;
        this.updatePositionForProjectionType();
        this.updateMatrices();
    }

    get projectionType(): ProjectionType {
        return this.type;
    }

    private updateMatrices() {
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateProjectionViewMatrix() {
        this.updateMatrices();
        mat4.multiply(this.projectionViewMatrix, this.viewMatrix, this.projectionMatrix);
        mat4.invert(this.viewProjectionInverse, this.projectionViewMatrix);
    }

    updateAspectRatio(width: number, height: number) {
        this.aspectRatio = width / height;
        this.width = width;
        this.height = height;
        this.updateProjectionViewMatrix();
    }

    pan(x: number, y: number) {
        const right = vec3.create();
        const front = vec3.create();

        const offset = vec3.create();
        vec3.sub(offset, this.position, this.target);
        let distance = Math.max(vec3.length(offset), 50);

        distance *= Math.tan(this.fovYRadian / 2);

        const left = (2 * x * distance) / this.height;
        const up = (2 * y * distance) / this.height;

        const direction = this.direction;
        vec3.normalize(direction, offset);
        vec3.cross(right, this.up, direction);
        vec3.cross(front, right, this.up);

        vec3.normalize(right, right);
        vec3.normalize(front, front);

        vec3.scale(right, right, -left);
        vec3.scale(front, front, -up);

        vec3.add(this.position, this.position, right);
        vec3.add(this.position, this.position, front);
        vec3.add(this.target, this.target, right);
        vec3.add(this.target, this.target, front);

        this.updateProjectionViewMatrix();
    }

    rotate(x: number, y: number) {
        const right = vec3.create();
        const front = this.dir;
        vec3.cross(right, this.up, front);
        vec3.normalize(right, right);

        const angleX = -(x / this.width) * 2 * Math.PI;
        let angleY = (-(y / this.height) * Math.PI) / 2;

        //rotate using quaternion around target
        const q1 = quat.create();
        const q2 = quat.create();

        const currentYAngle = Math.acos(vec3.dot(front, this.up));
        if (currentYAngle + angleY > this.maxangle) {
            angleY = this.maxangle - currentYAngle;
        } else if (currentYAngle + angleY < this.minangle) {
            angleY = this.minangle - currentYAngle;
        }

        quat.setAxisAngle(q1, right, angleY);
        quat.setAxisAngle(q2, this.up, angleX);
        quat.multiply(q1, q1, q2);

        vec3.sub(this.position, this.position, this.target);
        vec3.transformQuat(this.position, this.position, q1);
        vec3.add(this.position, this.position, this.target);

        this.updateProjectionViewMatrix();
    }

    get isOrthographic() {
        return this.projectionType === ProjectionType.ORTHOGRAPHIC;
    }

    zoom(factor: number, cursorPxX: number, cursorPxY: number) {
        if (this.isOrthographic) {
            this.zoomOrthographic(factor, cursorPxX, cursorPxY);
        } else {
            this.zoomPerspective(factor, cursorPxX, cursorPxY);
        }
    }

    private zoomOrthographic(factor: number, cursorPxX: number, cursorPxY: number) {
        this.left = this.left * factor;
        this.right = this.right * factor;
        this.top = this.top * factor;
        this.bottom = this.bottom * factor;
        this.updateProjectionViewMatrix();
    }

    private zoomPerspective(factor: number, cursorPxX: number, cursorPxY: number) {
        const offset = this.direction;
        vec3.sub(offset, this.position, this.target);
        vec3.scale(offset, offset, factor);

        vec3.add(this.position, this.target, offset);
        this.updateProjectionViewMatrix();
    }
}
