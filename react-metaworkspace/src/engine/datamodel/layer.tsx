import { Renderer } from "../renderer/renderer";
import { Grid } from "./grid";
import { ILayerData, IOverlayData, ILayerBaseData } from "../types";
import * as THREE from "three";
import { LayerStyle } from "./style";



class LayerBase {
    name: string;
    project: string;
    renderer: Renderer;
    grid: Grid | undefined; //undefined if the layer is not visible

    
    constructor(renderer: Renderer, project: string, data: ILayerBaseData) {
        this.name = data.name;
        this.project = project;
        this.renderer = renderer;
        this.grid = new Grid(data.layout, renderer, this as any);
    }
    
    update_visible_tiles(point: THREE.Vector3) {
        if (this.grid)
            this.grid.update_visible_tiles(point);
    }
}

export class Layer extends LayerBase{
    size: number;
    
    constructor(renderer: Renderer, project: string, data: ILayerData) {
        super(renderer, project, data);
        this.size = data.size;
        this.renderer.picker.registerLayer(this.name, this.size);
        
        if (this.grid)
            this.renderer.controls.focus(this.grid.focusPoint);
    }

}

export class Overlay extends LayerBase {
    source: string;
    target: string;

    constructor(renderer: Renderer, project: string, data: IOverlayData) {
        super(renderer, project, data);
        this.source = data.source;
        this.target = data.target;

        if (this.grid)
            this.renderer.controls.focus(this.grid.focusPoint);
    }
}

