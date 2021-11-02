import { Renderer } from "./renderer";
import { Grid } from "./grid";
import { ILayerData, IOverlayData, ILayerBaseData, ILayer, IOverlay } from "./types";
import { Vector2 } from "three";



class LayerBase implements ILayer {
    name: string;
    project: string;
    renderer: Renderer;
    grid: Grid | undefined; //undefined if the layer is not visible
    
    constructor(renderer: Renderer, project: string, data: ILayerBaseData) {
        this.name = data.name;
        this.project = project;
        this.renderer = renderer;

        if (this.renderer.style.layer(this.name).visible)
            this.grid = new Grid(data.layout, renderer, this);
    }
    
    focus(point: Vector2) {
        if (this.grid)
            this.grid.focus(point);
    }
}

export class Layer extends LayerBase{
    size: number;
    
    constructor(renderer: Renderer, project: string, data: ILayerData) {
        super(renderer, project, data);
        this.size = data.size;
        this.renderer.picker.registerLayer(this.name, this.size);
        
        if (this.grid)
            this.renderer.focus(this.grid.focusPoint);
    }

}

export class Overlay extends LayerBase implements IOverlay{
    source: string;
    target: string;

    constructor(renderer: Renderer, project: string, data: IOverlayData) {
        super(renderer, project, data);
        this.source = data.source;
        this.target = data.target;

        if (this.grid)
            this.renderer.focus(this.grid.focusPoint);
    }
}

