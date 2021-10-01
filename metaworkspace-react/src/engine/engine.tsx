import { Vector2 } from "three";
import iaxios from "../axios";
import { Layer } from "./layer";
import { Renderer } from "./renderer";
import { ILayerData } from "./types";


export class MetacityEngine {
    project: string;
    canvas: HTMLCanvasElement;
    
    renderer: Renderer;
    layers: Layer[];

    constructor(project: string, canvas: HTMLCanvasElement) {
        this.project = project;
        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas);
        this.layers = [];
    }

    init() {
        iaxios.post('/layout', {name: this.project}).then((response) => {
            const data: ILayerData[] = response.data;
            for(let ldata of data){
                let layer = new Layer(this.renderer, ldata);
                this.layers.push(layer);
            }

            this.moved();
        });

        this.renderer.controls.addEventListener('change', () => this.moved())
    }

    moved() {
        const fp = this.renderer.focus_point
        const fp2 = new Vector2(fp.x, fp.y);
        for (let layer of this.layers) {
            layer.focus(fp2);
        }
    }
}