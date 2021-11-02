import { Vector2 } from "three";
import iaxios from "../axios";
import { Layer, Overlay } from "./layer";
import { Renderer } from "./renderer";
import { ILayer } from "./types";


export class MetacityEngine {
    project: string;
    canvas: HTMLCanvasElement;
    
    renderer: Renderer;
    layers: ILayer[];

    constructor(project: string, canvas: HTMLCanvasElement) {
        this.project = project;
        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas);
        this.layers = [];
    }

    init() {
        iaxios.get(`api/data/${this.project}/layout.json`).then((response) => {
            for (const layer of response.data)
            {
                if(!layer.init)
                    continue;
                
                if (layer.type === "layer")
                    this.layers.push(new Layer(this.renderer, this.project, layer));
                if (layer.type === "overlay")
                    this.layers.push(new Overlay(this.renderer, this.project, layer));

            }
        });

        this.renderer.controls.addEventListener('change', () => this.moved())
    }

    moved() {
        const fp = this.renderer.focus_point
        const fp2 = new Vector2(fp.x, fp.y);
        for (let layer of this.layers) {
            layer.focus(fp2);
        }
        this.renderer.changed = true;
    }

    doubleclick(x: number, y: number) {
        this.renderer.click(x, y);
    }

    exit() {
        
    }
}