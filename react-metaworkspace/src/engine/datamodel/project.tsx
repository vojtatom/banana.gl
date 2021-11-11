
import { Renderer } from '../renderer/renderer'
import iaxios from '../../axios'
import { Layer, Overlay } from './layer'


export class Project {
    name: string;
    renderer: Renderer;
    layers: (Layer | Overlay)[];
    styles: string[];

    constructor(name: string, renderer: Renderer) {
        this.name = name;
        this.renderer = renderer;
        this.layers = [];
        this.styles = [];

        iaxios.get(`/api/data/${this.name}/layout.json`).then((response) => {
            const styles = response.data.styles;
            this.styles = styles;
            for (const layer of response.data.layers)
            {
                if(!layer.init || layer.disabled)
                    continue;
                
                if (layer.type === "layer")
                    this.layers.push(new Layer(this.renderer, this.name, layer, styles));   
            }

            for (const overlay of response.data.layers)
            {
                if(!overlay.init || overlay.disabled)
                    continue;
                
                if (overlay.type === "overlay")
                    this.layers.push(new Overlay(this.renderer, this.name, overlay, styles));   
            }
        });
    }

    update_visible_tiles(target: THREE.Vector3) {
        for (const layer of this.layers){
            layer.update_visible_tiles(target);
        }
    }

    applyStyle(style: string){
        if(this.styles.indexOf(style) === -1){
            return;
        }

        for(const layer of this.layers){
            layer.applyStyle(style);
        }
    }
}