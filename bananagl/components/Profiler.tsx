import React from 'react';

import { Scene } from '@3D/scene/scene';
import { Profiler as ProfilerClass } from '@3D/utils/profiler';

export interface ViewProps {
    scenes: Scene[];
}

export function Profiler(props: ViewProps) {
    const [profiler] = React.useState(new ProfilerClass());

    React.useEffect(() => {
        props.scenes.forEach((scene) => {
            profiler.addScene(scene);
        });

        const timer = setInterval(() => {
            profiler.logMemory();
        }, 2000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return null;
}
