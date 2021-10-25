import { Renderer } from "./renderer";
import { Grid } from "./grid";
import { ILayerData, ILayer } from "./types";
import { Vector2 } from "three";



export class Layer implements ILayer{
    name: string;
    project: string;
    grid: Grid;
    renderer: Renderer;

    constructor(renderer: Renderer, project: string, data: ILayerData) {
        this.name = data.name;
        this.project = project;
        this.grid = new Grid(data.layout, renderer, this);
        this.renderer = renderer;
        this.renderer.focus(this.grid.focusPoint);
    }

    focus(point: Vector2) {
        this.grid.focus(point);
    }
}