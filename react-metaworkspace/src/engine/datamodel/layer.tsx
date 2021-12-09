import * as THREE from "three";
import iaxios from "../../axios";
import { apiurl } from "../../url";
import { Model } from "../geometry/base";
import { Renderer } from "../renderer/renderer";
import { LayerStyle } from "../renderer/style";
import { ILayerBaseData, ILayerData, IOverlayData } from "../types";
import { Grid } from "./grid";
import { Timeline } from "./timeline";


abstract class LayerBase {
    name: string;
    project: string;
    renderer: Renderer;
    grid?: Grid; //undefined if the layer is not visible
    timeline?: Timeline; 
    style?: LayerStyle;
    visibility: boolean;


    constructor(renderer: Renderer, project: string, data: ILayerBaseData, style_names: string[]) {
        this.name = data.name;
        this.project = project;
        this.renderer = renderer;
        this.visibility = true;
    }

    set visible(v: boolean) {
        if (v === this.visibility)
            return;

        this.visibility = v;
        if (this.visibility)
            this.show();
        else
            this.hide();
    }

    get visible() {
        return this.visibility;
    }
    
    init(data: ILayerBaseData) {
        if (data.grid)
        {
            this.grid = new Grid(data.grid, this.renderer, this as any);
            this.renderer.controls.focus(this.grid.center);
            this.grid.updateVisibleTiles(this.renderer.controls.target);
            this.renderer.changed = true;
        }

        if (data.timeline)
        {  
            this.timeline = new Timeline(data.timeline, this.renderer, this as any);
            this.renderer.changed = true;
        }
    }

    updateVisibleRadius(point: THREE.Vector3) {
        if (!this.visibility)
            return;

        if (this.grid)
            this.grid.updateVisibleTiles(point);
    }

    hide() {
        if (this.grid)
            this.grid.hide();
        if (this.timeline)
            this.timeline.hide();
        this.renderer.changed = true;
    }
    
    show() {
        if (this.grid)
            this.grid.reloadVisibility();
        if (this.timeline)
            this.timeline.show();
        this.renderer.changed = true;
    }

    setVisibleRadius(radius: number) {
        if (this.grid)
        {
            this.grid.visible_radius = radius;
            if (this.visible)
                this.grid.reloadVisibility();
        }

        this.renderer.changed = true;
    }

    applyStyle(style: string) {
        this.renderer.status.actions.loadingStyles.start();
        iaxios.get(`${apiurl.PROJECTDATA}${this.project}/styles/${style}/${this.name}.json`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }).then((response) => {
            this.renderer.status.actions.loadingStyles.stop();
            this.renderer.status.actions.applyingStyles.start();
            new LayerStyle(response.data, (lstyle: LayerStyle) => {
                this.style = lstyle;

                if (this.grid)
                {
                    for (let tile of this.grid.tiles.values()) {
                        this.applyStyleToModels(tile.models);
                    }
                }

                this.renderer.status.actions.applyingStyles.stop();
            });
        }).catch(() => {
            this.clearStyle();
        });
    }

    abstract applyStyleToModels(models: Model[]): void;
    abstract getOffset(): number;

    clearStyle() {
        this.style = undefined;
        if (this.grid)
            for (let tile of this.grid.tiles.values()) {
                this.applyStyleToModels(tile.models);
            }
    }

    enableCache() {
        if (this.grid)
            for (let tile of this.grid.tiles.values()) {
                tile.enableCache();
            }
    }

    disableCache() {
        if (this.grid)
            for (let tile of this.grid.tiles.values()) {
                tile.disableCache();
            }
    }
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
            model.applyStyle(offset, this.style);
        }
    }

    getOffset() {
        return this.renderer.picker.offsetForLayer(this.name);
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
            model.applyStyle(offset, this.style);
        }
    }

    getOffset() {
        return this.renderer.picker.offsetForLayer(this.source);
    }
}

