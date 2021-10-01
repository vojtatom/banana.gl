import { useEffect, createRef } from "react";
import { useParams } from "react-router";
import { MetacityEngine } from "../engine/engine";


export function ProjectView() {
    const { name } = useParams<{name: string}>();
    const canvas = createRef<HTMLCanvasElement>();
    let renderer: MetacityEngine;
    
    useEffect(() => {
        if (canvas.current == null)
        return
        
        renderer = new MetacityEngine(name, canvas.current);
        renderer.init();
        renderer.renderer.frame();
      }, [canvas, name]);

    return (
        <div>
            <canvas ref={canvas}>Your browser does not support HTML5 canvas</canvas>
        </div>
    )
}