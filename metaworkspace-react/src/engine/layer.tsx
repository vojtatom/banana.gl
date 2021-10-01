import { Renderer } from "./renderer";
import { Grid } from "./grid";
import { ILayerData, StrToNum, NumToStr, ILayer } from "./types";
import { Vector2, Vector3 } from "three";


class LayerObjects {
    id_to_oid: NumToStr;
    oid_to_id: StrToNum;

    constructor(ito: NumToStr, oti: StrToNum) {
        this.id_to_oid = ito;
        this.oid_to_id = oti;
    }
}

export class Layer implements ILayer{
    project: string;
    name: string;
    shift: Vector3;
    grid: Grid;
    objects: LayerObjects;
    renderer: Renderer;

    constructor(renderer: Renderer, data: ILayerData) {
        this.name = data.name;
        this.project = data.project;
        this.shift = new Vector3(...data.shift);
        this.objects = new LayerObjects(data.grid.id_to_oid, data.grid.oid_to_id);
        this.grid = new Grid(data.grid, renderer, this);
        this.renderer = renderer;
    }

    focus(point: Vector2) {
        this.grid.focus(point);
    }
}