import { View } from '@bananagl/window/view';
import { ViewPosition, ViewSize } from '@bananagl/window/window';

import { Renderer } from './renderer';

interface ViewInterface {
    view: View;
    size: ViewSize;
    position: ViewPosition;
}

export function mountRenderer(
    canvas: HTMLCanvasElement,
    renderer: Renderer,
    options: WebGLContextAttributes,
    views: ViewInterface[]
) {
    console.log('Canvas mounted');
    renderer.init(canvas, options);

    for (const view of views) {
        renderer.window.add(view.view, view.size, view.position);
    }

    renderer.window.forceResize();
    if (!renderer.running) renderer.animationLoop();
}

export function unmountRenderer(renderer: Renderer) {
    console.log('Canvas unmounted');
    renderer.dispose();
}
