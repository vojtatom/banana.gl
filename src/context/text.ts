import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { GraphicContext } from "./context";


export class Labels {
    private labels = new Map<number, CSS2DObject>();
    
    constructor(private ctx: GraphicContext) {

    }

    label(x: number, y: number, z: number, text: string, objectID?: number) {
        if (!objectID)
            return;

        if (this.removeLabel(objectID))
            return;

        const obj = this.createLabel(x, y, z, text);
        this.labels.set(objectID, obj);
    }

    labelForBBox(bbox: [number[], number[]], text: string, objectID?: number) {
        const center = [(bbox[0][0] + bbox[1][0]) * 0.5, (bbox[0][1] + bbox[1][1]) * 0.5, bbox[1][2]];
        this.label(center[0], center[1], center[2], text, objectID);
    }

    get size() {
        return this.labels.size;
    }

    private removeLabel(objectID: number) {
        const label = this.labels.get(objectID);
        if (label) {
            this.ctx.labelScene.remove(label);
            this.labels.delete(objectID);
            return true;
        }
        return false;
    }

    private createLabel(x: number, y: number, z: number, text: string) {
        const elm = this.createLabelElement(text);
        const label = new CSS2DObject(elm);
        label.position.set(x, y, z);
        this.ctx.labelScene.add(label);
        return label;
    }

    private createLabelElement(text: string) {
        const elm = document.createElement('div') as HTMLDivElement;
        elm.className = 'label';
        elm.textContent = text;
        elm.style.background = 'rgba(255, 255, 255, 0.7)';
        elm.style.color = '#000000';
        elm.style.fontSize = '1em';
        elm.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
        elm.style.borderRadius = '0.3em';
        elm.style.padding = '0 0.5em';
        return elm;
    }
}


