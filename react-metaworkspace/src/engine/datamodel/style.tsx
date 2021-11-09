import { ILayerStyle } from "../types";


export class LayerStyle {
    styles: ILayerStyle;

    constructor(styles: ILayerStyle) {
        this.styles = styles;
    }

    get pickable() {
        if (this.styles.pickable) {
            return this.styles.pickable;
        }
        return true;
    }

    get visible() {
        if (this.styles.visible) {
            return this.styles.visible;
        }
        return true;
    }

    get color_buffer() {
        if (this.styles.buffer) 
            return this.styles.buffer;

        
        throw new Error("No colors defined");
    }

    get color_buffer_target() {
        if (this.styles.buffer_target) 
            return this.styles.buffer_target;
        throw new Error("No colors defined");
    }

    get color_buffer_source() {
        if (this.styles.buffer_source) 
            return this.styles.buffer_source;
        throw new Error("No colors defined");
    }
}


class ProjectStyle {
    
}