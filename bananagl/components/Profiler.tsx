import React from 'react';

import { Renderer } from '@bananagl/renderer/renderer';
import { Scene } from '@bananagl/scene/scene';
import { Profiler as ProfilerClass } from '@bananagl/utils/profiler';

export interface ViewProps {
    scenes: Scene[];
    renderer: Renderer;
}

export function Profiler(props: ViewProps) {
    const [profiler] = React.useState(new ProfilerClass());

    React.useEffect(() => {
        props.scenes.forEach((scene) => {
            profiler.addScene(scene);
        });

        profiler.setRenderer(props.renderer);

        const timer = setInterval(() => {
            const mem = profiler.logMemory();
            const fps = profiler.logFps();

            console.log(`FPS: ${fps}, Memory: ${mem}`);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return null;
}
