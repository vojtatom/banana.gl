import { vec3 } from 'gl-matrix';

/**
 * An enumeration of the types of projections that can be used for rendering a scene.
 */
export enum ProjectionType {
    /**
     * A perspective projection, which simulates the way objects appear smaller as they move farther away.
     */
    PERSPECTIVE,

    /**
     * An orthographic projection, which maintains the relative size of objects regardless of their distance from the camera.
     */
    ORTHOGRAPHIC,
}

/**
 * An interface representing the options that can be passed to a `Camera` constructor.
 */
export interface CameraOptions {
    /**
     * The position of the camera in 3D space.
     */
    position?: vec3;

    /**
     * The point in 3D space that the camera is looking at.
     */
    target?: vec3;

    /**
     * The up vector of the camera.
     */
    up?: vec3;

    /**
     * The right vector of the camera.
     */
    right?: vec3;

    /**
     * The type of projection to use for rendering the scene.
     */
    projectionType?: ProjectionType;

    /**
     * The vertical field of view angle in radians.
     */
    fovYRadian?: number;

    /**
     * The width of the viewport in pixels.
     */
    width?: number;

    /**
     * The height of the viewport in pixels.
     */
    height?: number;

    /**
     * The distance to the near clipping plane.
     */
    near?: number;

    /**
     * The distance to the far clipping plane.
     */
    far?: number;
}
