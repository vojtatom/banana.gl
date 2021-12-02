
import { Renderer } from '../renderer/renderer'
import iaxios from '../../axios'
import { Layer, Overlay } from './layer'


export class Project {
    name: string;
    renderer: Renderer;
    layers: (Layer | Overlay)[];
    styles: string[];
    usedStyle?: string;

    constructor(name: string, renderer: Renderer) {
        this.name = name;
        this.renderer = renderer;
        this.layers = [];
        this.styles = [];

        iaxios.get(`/api/data/${this.name}/layout.json`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }).then((response) => {
            const styles = response.data.styles;
            this.styles = styles;
            for (const layer of response.data.layers)
            {
                if(layer.disabled || !(layer.grid || layer.timeline))
                    continue;
                
                if (layer.type === "layer")
                    this.layers.push(new Layer(this.renderer, this.name, layer, styles));   
            }

            for (const overlay of response.data.layers)
            {
                if(overlay.disabled || !(overlay.grid || overlay.timeline))
                    continue;
                
                if (overlay.type === "overlay")
                    this.layers.push(new Overlay(this.renderer, this.name, overlay, styles));   
            }
        });
    }

    updateVisibleRadius(target: THREE.Vector3) {
        for (const layer of this.layers){
            layer.updateVisibleRadius(target);
        }
    }

    setVisibleRadius(radius: number) {
        for(let layer of this.layers)
            layer.setVisibleRadius(radius);
    }

    useCache(enable: boolean){
        for(let layer of this.layers)
            enable? layer.enableCache() : layer.disableCache();
    }

    applyStyle(style: string){
        if(this.styles.indexOf(style) === -1){
            return;
        }

        this.usedStyle = style;
        for(const layer of this.layers){
            layer.applyStyle(style);
        }
    }

    clearStyle(){
        this.usedStyle = undefined;
        for(const layer of this.layers){
            layer.clearStyle();
        }
    }
}