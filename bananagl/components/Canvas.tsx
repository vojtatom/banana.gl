import React from 'react';

import { Renderer } from '@bananagl/bananagl';
import { View as ViewClass } from '@bananagl/renderer/view';

import { View as ViewComponent, ViewProps } from './View';

interface CanvasProps {
    renderer: Renderer;
    children?:
        | React.ReactElement<ViewProps, typeof ViewComponent>
        | React.ReactElement<ViewProps, typeof ViewComponent>[];
    className?: string;
    options?: WebGLContextAttributes;
    debugLayout?: boolean;
}

export function Canvas(props: CanvasProps) {
    const { options, renderer, children } = props;
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        console.log('Canvas mounted');
        if (canvasRef.current && renderer) {
            renderer.init(canvasRef.current, options);
            const viewArray = React.Children.toArray(children) as React.ReactElement<
                ViewProps,
                typeof ViewComponent
            >[];
            for (const view of viewArray) {
                const viewObject = new ViewClass(view.props.scene);
                const viewSize = {
                    width: view.props.width,
                    height: view.props.height,
                    mode: view.props.sizeMode ?? 'relative',
                };
                const viewPosition = {
                    top: view.props.top,
                    left: view.props.left,
                    right: view.props.right,
                    bottom: view.props.bottom,
                    mode: view.props.positionMode ?? 'relative',
                };
                renderer.window.add(viewObject, viewSize, viewPosition);
            }

            renderer.window.forceResize();

            if (props.debugLayout) {
                renderer.renderLayout();
            } else {
                renderer.animationLoop();
            }
        }

        return () => {
            console.log('Canvas unmounted');
            if (renderer) {
                renderer.destroy();
            }
        };
    }, [canvasRef, renderer]);

    return (
        <>
            <canvas ref={canvasRef} className={props.className} key="canvas" />
            {props.children}
        </>
    );
}
