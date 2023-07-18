import React from 'react';
import { Renderer, View, Scene, mountRenderer, unmountRenderer } from '@bananagl/bananagl';

//
//Initialization demo - init renderer and add one full screen view
//

export function DemoInit() {
    const ref = React.useRef<HTMLCanvasElement>(null);
    const [renderer] = React.useState<Renderer>(new Renderer());
    const [scene] = React.useState<Scene>(new Scene());

    React.useEffect(() => {
        if (ref.current) {
            const canvas = ref.current;
            mountRenderer(canvas, renderer, {}, [
                {
                    view: new View(scene),
                    size: { width: 100, height: 100, mode: 'relative' },
                    position: { top: 0, left: 0, mode: 'relative' },
                },
            ]);

            renderer.clearColor = [0.5, 0.5, 0.5, 1];
        }

        return () => {
            unmountRenderer(renderer);
        };
    }, []);

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
            }}
        >
            <canvas
                id="canvas"
                key="canvas"
                ref={ref}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
        </div>
    );
}
