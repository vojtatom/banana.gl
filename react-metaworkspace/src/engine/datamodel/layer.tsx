import { Renderer } from "../renderer/renderer";
import { Grid } from "./grid";
import { ILayerData, IOverlayData, ILayerBaseData } from "../types";
import * as THREE from "three";
import { LayerStyle } from "../renderer/style";
import iaxios from "../../axios";
import { Model } from "../geometry/base";



abstract class LayerBase {
    name: string;
    project: string;
    renderer: Renderer;
    grid!: Grid; //undefined if the layer is not visible
    style?: LayerStyle;

    constructor(renderer: Renderer, project: string, data: ILayerBaseData, style_names: string[]) {
        this.name = data.name;
        this.project = project;
        this.renderer = renderer;
    }
    
    init(data: ILayerBaseData) {
        this.grid = new Grid(data.layout, this.renderer, this as any);
        this.renderer.controls.focus(this.grid.center);
        this.grid.update_visible_tiles(this.renderer.controls.target);
        this.renderer.changed = true;
    }

    update_visible_tiles(point: THREE.Vector3) {
        if (this.grid)
            this.grid.update_visible_tiles(point);
    }

    applyStyle(style: string) {
        iaxios.get(`/api/data/${this.project}/styles/${style}/${this.name}.json`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }).then((response) => {
            const style = new LayerStyle(response.data, (lstyle: LayerStyle) => {
                this.style = lstyle;
                for (let [_, tile] of this.grid.tiles) {
                    this.applyStyleToModels(tile.models);
                }
            });
        }).catch((_) => {
            for (let [_, tile] of this.grid.tiles) {
                this.applyStyleToModels(tile.models);
            }
        });
    }

    abstract applyStyleToModels(models: Model[]): void;
}


export class Layer extends LayerBase {
    size: number;

    constructor(renderer: Renderer, project: string, data: ILayerData, style_names: string[]) {
        super(renderer, project, data, style_names);
        this.size = data.size;
        this.renderer.picker.offsetForLayer(this.name, this.size);
        this.init(data);
    }

    applyStyleToModels(models: Model[]) {
        const offset = this.renderer.picker.offsetForLayer(this.name);
        
        for (let model of models) {
            if (this.style)
                model.applyStyle(offset, this.style);
        }
    }
}

export class Overlay extends LayerBase {
    source: string;
    target: string;
    size: [number, number];

    constructor(renderer: Renderer, project: string, data: IOverlayData, style_names: string[]) {
        super(renderer, project, data, style_names);
        this.source = data.source;
        this.target = data.target;
        this.size = data.size;
        this.renderer.picker.offsetForLayer(this.source, this.size[0]);
        this.renderer.picker.offsetForLayer(this.target, this.size[1]);
        this.init(data);
    }

    applyStyleToModels(models: Model[]) {
        const offset = this.renderer.picker.offsetForLayer(this.source);
        
        for (let model of models) {
            if (this.style)
                model.applyStyle(offset, this.style);
        }
    }
}

