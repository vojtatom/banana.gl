import { Pane } from "evergreen-ui";
import { useEffect, createRef } from "react"
import { useParams } from "react-router"
import { MetacityEngine } from "../engine/engine"


export function View() {
    const { project_name } = useParams<{project_name: string}>();
    const canvas = createRef<HTMLCanvasElement>();
    let renderer: MetacityEngine;
    
    useEffect(() => {
        if (canvas.current == null)
            return;
        
        renderer = new MetacityEngine(project_name, canvas.current);
        renderer.init();
        renderer.renderer.frame();

        return function cleanup() {
            renderer.exit();
            window.location.reload();
          };

      }, [canvas, project_name]);


    return (
        <Pane className="canvasAnchor">
            <canvas 
                ref={canvas}
                onDoubleClick={(event) => renderer.doubleclick(event.clientX, event.clientY)}
                onKeyDown={(event) => { if (event.repeat) return; renderer.keyDown(event.code); }}
                onKeyUp={(event) => { if (event.repeat) return; renderer.keyUp(event.code); }}
                tabIndex={0}
            >
                    Your browser does not support HTML5 canvas
            </canvas>
        </Pane>
    )
}