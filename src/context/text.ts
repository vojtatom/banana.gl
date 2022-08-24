import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { GraphicContext } from "./context";







function Label(ctx: GraphicContext, x: number, y: number, z: number, text: string) {
    const elm = document.createElement( 'div' ) as HTMLDivElement;
    elm.className = 'label';
    elm.textContent = text;
    elm.style.background = 'rgba(255, 255, 255, 0.7)';
    elm.style.color = '#000000';
    elm.style.fontSize = '1em';
    elm.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
    elm.style.borderRadius = '0.3em';
    elm.style.padding = '0 0.5em';


    //text.style.zIndex = '3';

    const label = new CSS2DObject( elm );
    label.position.set(x, y, z);
    console.log(x, y, z);
    ctx.scene.add( label );
    return label;
}


export interface Labels {
    label: (x: number, y: number, z: number, text: string, objectID?: number) => void;
    labelForBBox: (bbox: [number[], number[]], text: string, objectID?: number) => void;
}

export function Labels(ctx: GraphicContext): Labels {
    const labels = new Map<number, CSS2DObject>();

    const label = (x: number, y: number, z: number, text: string, objectID?: number) => {
        if (objectID) {
            const label = labels.get(objectID);
            if (label) {
                ctx.scene.remove(label);
                labels.delete(objectID);
                return;
            }
        }
        
        const obj = Label(ctx, x, y, z, text);
        if (objectID) {
            labels.set(objectID, obj);
        }
    }

    const labelForBBox = (bbox: [number[], number[]], text: string, objectID?: number) => {
        const center = [ (bbox[0][0] + bbox[1][0]) * 0.5, (bbox[0][1] + bbox[1][1]) * 0.5, bbox[1][2] ];
        label(center[0], center[1], center[2], text, objectID);
    }

    return {
        label,
        labelForBBox
    }
}