
import { Renderer } from '../renderer/renderer'
import iaxios from '../../axios'
import { Layer, Overlay } from './layer'


export class Project {
    name: string;
    renderer: Renderer;
    layers: (Layer | Overlay)[];

    constructor(name: string, renderer: Renderer) {
        this.name = name;
        this.renderer = renderer;
        this.layers = [];

        iaxios.get(`/api/data/${this.name}/layout.json`).then((response) => {
            for (const layer of response.data.layers)
            {
                if(!layer.init)
                    continue;
                
                console.log(layer);
                if (layer.type === "layer")
                    this.layers.push(new Layer(this.renderer, this.name, layer));
                if (layer.type === "overlay")
                    this.layers.push(new Overlay(this.renderer, this.name, layer));
    
            }
        });
    }

    update_visible_tiles(target: THREE.Vector3) {
        for (const layer of this.layers)
            layer.update_visible_tiles(target);
    }
}