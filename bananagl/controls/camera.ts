import { mat4, quat, vec2, vec3, vec4 } from 'gl-matrix';

import { UniformValue } from '@bananagl/shaders/shader';

export enum ProjectionType {
    PERSPECTIVE,
    ORTHOGRAPHIC,
}

export interface CameraOptions {
    position?: vec3;
    target?: vec3;
    up?: vec3;
    right?: vec3;
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
    type: ProjectionType;
    fovYRadian: number;
    aspectRatio: number;
    near: number;
    far: number;

    readonly projectionMatrix: mat4 = mat4.create();
    readonly viewProjectionInverse: mat4 = mat4.create();
    readonly viewMatrix: mat4 = mat4.create();
    readonly projectionViewMatrix: mat4 = mat4.create();

    private upV: vec3;
    private rightV: vec3;
    private directionTMP: vec3 = vec3.create();
    private upTMP: vec3 = vec3.create();

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
        this.position = options.position ?? vec3.fromValues(0, 0, 5000);
        this.target = options.target ?? vec3.fromValues(0, 0, 0);
        this.upV = options.up ?? vec3.fromValues(0, 0, 1);
        this.rightV = options.right ?? vec3.fromValues(1, 0, 0);
        this.type = options.projectionType ?? ProjectionType.ORTHOGRAPHIC;
        this.fovYRadian = options.fovYRadian ?? Math.PI / 4;
        this.width = options.width ?? 1;
        this.height = options.height ?? 1;
        this.aspectRatio = this.width / this.height;
        this.near = options.near ?? 1;
        this.far = options.far ?? 10000;

        this.uniforms_['uCameraPosition'] = this.position;
        this.uniforms_['uCameraTarget'] = this.target;
        this.uniforms_['uCameraUp'] = this.upV;
        this.uniforms_['uProjectionMatrix'] = this.projectionMatrix;
        this.uniforms_['uViewMatrix'] = this.viewMatrix;
        this.uniforms_['uProjectionViewMatrix'] = this.projectionViewMatrix;

        this.updateOrthoBounds();
        this.updateMatrices();
    }

    private updateOrthoBounds() {
        this.left = this.width / -2;
        this.right = this.width / 2;
        this.bottom = this.height / -2;
        this.top = this.height / 2;
    }

    set(options: CameraOptions) {
        if (options.position) this.position = options.position;
        if (options.target) this.target = options.target;
        if (options.up) this.upV = options.up;
        if (options.right) this.rightV = options.right;
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
        if (this.projectionType === ProjectionType.ORTHOGRAPHIC) return this.right - this.left;
        const distance = vec3.dist(this.position, this.target);
        return 2 * distance * Math.tan(this.fovYRadian / 2);
    }

    private getFrustumHeightAtTarget(): number {
        if (this.projectionType === ProjectionType.ORTHOGRAPHIC) return this.top - this.bottom;
        return this.getFrustrumWidthAtTarget() / this.aspectRatio;
    }

    private swapPositionForProjection(newProjection: ProjectionType) {
        vec3.sub(this.directionTMP, this.target, this.position);
        vec3.normalize(this.directionTMP, this.directionTMP);

        if (newProjection === ProjectionType.PERSPECTIVE) {
            const width = this.getFrustrumWidthAtTarget();
            const distance = width / (2 * Math.tan(this.fovYRadian / 2));
            vec3.scale(this.directionTMP, this.directionTMP, distance);
            vec3.sub(this.position, this.target, this.directionTMP);
        } else {
            const width = this.getFrustrumWidthAtTarget();
            const height = width / this.aspectRatio;
            const initDistance = 5000;
            vec3.scale(this.directionTMP, this.directionTMP, initDistance);
            vec3.sub(this.position, this.target, this.directionTMP);

            this.left = -width / 2;
            this.right = width / 2;
            this.bottom = -height / 2;
            this.top = height / 2;
        }
    }

    private get direction() {
        vec3.sub(this.directionTMP, this.position, this.target);
        vec3.normalize(this.directionTMP, this.directionTMP);
        return this.directionTMP;
    }

    private get up() {
        const direction = this.direction;
        if (Math.abs(vec3.dot(direction, this.upV)) === 1) {
            return vec3.cross(this.upTMP, direction, this.rightV);
        }
        return this.upV;
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
        if (projectionType === this.projectionType) return;
        this.swapPositionForProjection(projectionType);
        this.type = projectionType;
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
        this.updateOrthoBounds();
        this.updateProjectionViewMatrix();
    }

    private updateRightVector() {
        vec3.cross(this.rightV, this.up, this.direction);
        this.rightV[2] = 0;
        vec3.normalize(this.rightV, this.rightV);
    }

    get isOrthographic() {
        return this.projectionType === ProjectionType.ORTHOGRAPHIC;
    }

    private rightTMP = vec3.create();
    private frontTMP = vec3.create();

    pan(x: number, y: number) {
        const right = this.rightTMP;
        const front = this.frontTMP;
        vec3.copy(right, this.rightV);

        //This is a bit riscy, since the right does not always have to be in the horizontal plane
        vec3.cross(front, this.upV, right);

        const heightUnit = this.getFrustumHeightAtTarget() / this.height;
        const widthUnit = this.getFrustrumWidthAtTarget() / this.width;

        vec3.normalize(right, right);
        vec3.normalize(front, front);

        vec3.scale(right, right, -widthUnit * x);
        vec3.scale(front, front, heightUnit * y);

        vec3.add(this.position, this.position, right);
        vec3.add(this.position, this.position, front);
        vec3.add(this.target, this.target, right);
        vec3.add(this.target, this.target, front);

        this.updateRightVector();
        this.updateProjectionViewMatrix();
    }

    rotate(x: number, y: number) {
        const angleX = -(x / this.width) * 2 * Math.PI;
        let angleY = -(y / this.height) * Math.PI;

        //rotate using quaternion around target
        const q1 = quat.create();
        const q2 = quat.create();

        const currentYAngle = Math.acos(vec3.dot(this.direction, this.upV));
        if (currentYAngle + angleY > this.maxangle) {
            angleY = this.maxangle - currentYAngle;
        } else if (currentYAngle + angleY < this.minangle) {
            angleY = this.minangle - currentYAngle;
        }

        quat.setAxisAngle(q1, this.rightV, angleY);
        quat.setAxisAngle(q2, this.upV, angleX);
        quat.multiply(q1, q1, q2);

        vec3.sub(this.position, this.position, this.target);
        vec3.transformQuat(this.position, this.position, q1);
        vec3.add(this.position, this.position, this.target);
        this.updateRightVector();

        this.updateProjectionViewMatrix();
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

    topView() {
        const distance = vec3.distance(this.position, this.target);
        vec3.set(this.position, this.target[0], this.target[1], this.target[2] + distance);
        vec3.set(this.rightV, 1, 0, 0);
        this.updateProjectionViewMatrix();
    }

    frontView() {
        const distance = vec3.distance(this.position, this.target);
        vec3.set(this.position, this.target[0], this.target[1] - distance, this.target[2]);
        this.updateRightVector();
        this.updateProjectionViewMatrix();
    }

    sideView() {
        const distance = vec3.distance(this.position, this.target);
        vec3.set(this.position, this.target[0] + distance, this.target[1], this.target[2]);
        this.updateRightVector();
        this.updateProjectionViewMatrix();
    }

    get z() {
        return this.target[2];
    }

    set z(z: number) {
        const delta = z - this.target[2];
        this.target[2] += delta;
        this.position[2] += delta;
        this.updateProjectionViewMatrix();
    }
}
