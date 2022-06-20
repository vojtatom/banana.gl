import { Graphics } from "./graphics";
import { Layer, LayerType } from "./layer";


interface IBananaGL {
    canvas: HTMLCanvasElement;
}


export class BananaGL {
    graphics: Graphics;
    layers: Layer[] = [];

    constructor(props: IBananaGL) {
        this.graphics = new Graphics(props.canvas);
    }

    layer(props: LayerType) {
        this.layers.push(new Layer(props));
    }
}