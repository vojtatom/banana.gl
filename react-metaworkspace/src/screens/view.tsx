import { Pane } from "evergreen-ui";
import { useEffect, createRef, useState, useLayoutEffect } from "react"
import { useParams } from "react-router"
import { MetacityEngine } from "../engine/engine"
import { ViewMenu } from "./elements/viewmenu"
import { MetaDialog } from "./elements/metadialog"


function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}


export function View() {
    const { project_name } = useParams<{ project_name: string }>();
    const [width, height] = useWindowSize();
    const [engine, setEngine] = useState<MetacityEngine | undefined>(undefined);
    const canvas = createRef<HTMLCanvasElement>();

    useEffect(() => {
        if (canvas.current == null)
            return;

        const engine = new MetacityEngine(project_name, canvas.current);
        engine.init();
        setEngine(engine);

        engine.renderer.frame();

        return () => {
            engine.exit();
            window.location.reload();
        };

    }, [project_name]);


    useEffect(() => {
        if (engine == null)
            return;

        engine.controls?.resize(width, height);
    }, [width, height]);

    return (
        <Pane className="canvasAnchor">
            <MetaDialog engine={engine} />
            <ViewMenu engine={engine} />
            <canvas
                ref={canvas}
                onDoubleClick={(event) => { if (!engine) return; engine.controls?.doubleclick(event.clientX, event.clientY) }}
                onKeyDown={(event) => { if (event.repeat || !engine) return; engine.controls?.keyDown(event.code); }}
                onKeyUp={(event) => { if (event.repeat || !engine) return; engine.controls?.keyUp(event.code); }}
                tabIndex={0}
            >
                Your browser does not support HTML5 canvas
            </canvas>
            <Pane id="viewStatusBar">
                Status
            </Pane>
        </Pane>
    )
}