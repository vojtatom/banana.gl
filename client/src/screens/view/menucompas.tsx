import { CompassIcon, IconButton, Tooltip } from "evergreen-ui";
import { useEffect, useState } from "react";
import { MetacityEngine } from "../../engine/engine";


export function Compas(props: { engine: MetacityEngine | undefined }) {
    const { engine } = props;
    const [angle, setAngle] = useState<number>(0);

    const rotate = (angleInRadians: number) => {
        const angleInDegrees = - (angleInRadians * 180 / Math.PI);
        setAngle(angleInDegrees);
    }

    useEffect(() => {
        if (!engine || !engine.controls)
            return;

        engine.controls.updateCompasCallback = rotate;
    }, [engine]);

    const resetRotation = () => {
        engine?.renderer.controls.topView();
    }

    return (
        <Tooltip content="Reset view rotation">
            <IconButton icon={<CompassIcon style={{ transform: `rotate(${angle}deg)` }} />} appearance="minimal" onClick={resetRotation} />
        </Tooltip>
    );
}
