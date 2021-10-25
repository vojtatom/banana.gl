import { Vector2 } from "three";
import iaxios from "../axios";
import { Layer } from "./layer";
import { Renderer } from "./renderer";


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
        iaxios.get(`/data/${this.project}/layout.json`).then((response) => {
            for (const layer of response.data)
            {
                if(!layer.init)
                    return;
                this.layers.push(new Layer(this.renderer, this.project, layer));
            }

            //this.layers.push(new Layer(this.renderer, this.project, response.data[0]));
        });

        this.renderer.controls.addEventListener('change', () => this.moved())
    }

    moved() {
        this.renderer.updateOnMove();
        const fp = this.renderer.focus_point
        const fp2 = new Vector2(fp.x, fp.y);
        for (let layer of this.layers) {
            layer.focus(fp2);
        }
    }
}