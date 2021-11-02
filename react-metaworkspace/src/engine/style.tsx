

class LayerStyle {
    visible: boolean = true;
    constructor(settings: any = {}) {
        this.apply(settings);
    }

    apply(settings: any) {
        for (let key in this){
            if (settings[key] !== undefined)
                this[key] = settings[key];
        }
    }
}

export class Style {
    private style: any;

    constructor(styles: any) {
        this.style = styles;
    }

    layer(name: string){
        const layerStyle = this.style[name];
        if (layerStyle)
            return new LayerStyle(layerStyle);
        return new LayerStyle()
    }
}