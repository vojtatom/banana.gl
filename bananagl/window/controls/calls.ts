import { vec2 } from 'gl-matrix';

import { RectSelector } from '@bananagl/picking/rect';

import { View } from '../view';

export function rotate(view: View, dx: number, dy: number) {
    view.cameraLock.restrictRotate(dx, dy);
    const { coords } = view.cameraLock;
    view.camera.rotate(coords[0], coords[1]);
}

export function pan(view: View, dx: number, dy: number) {
    view.camera.pan(dx, dy);
}

export function zoom(view: View, delta: number, x: number, y: number) {
    view.camera.zoom(delta, x, y);
}

export function trace(view: View, x: number, y: number) {
    const ndc = view.toNDC(x, y);
    const ray = view.camera.primaryRay(ndc[0], ndc[1]);
    const hit = view.scene.picker.trace(ray);
    return hit;
}

export function traceRange(view: View, from: vec2, to: vec2) {
    const ndcFrom = view.toNDC(from[0], from[1]);
    const ndcTo = view.toNDC(to[0], to[1]);
    const rect = new RectSelector(view.camera, ndcFrom, ndcTo);
    const hit = view.scene.picker.traceRect(rect);
    return hit;
}
