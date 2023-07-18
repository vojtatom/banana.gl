import React from 'react';
import { Renderer, View, Scene, mountRenderer } from '@bananagl/bananagl';

export function DemoBasic() {
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
    }, [ref]);

    return (
        <div>
            <canvas id="canvas" width="500" height="500" ref={ref}></canvas>
        </div>
    );
}
