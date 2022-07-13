import { Vector3, Vector2 } from "three";
import { Graphics } from "./graphics";
import { Layer, LayerType } from "./layer";
import { Loaders } from "./loader";
import { Navigation } from "./navigation";

interface IBananaGL {
    canvas: HTMLCanvasElement;
    workerPath?: string;
    location?: {
        x: number;
        y: number;
    };
}


export class BananaGL {
    graphics: Graphics;
    layers: Layer[] = [];

    constructor(props: IBananaGL) {
        this.graphics = new Graphics(props.canvas);

        if (props.workerPath) {
            Loaders.workerPath = props.workerPath;
        }

        if (props.location) {
            Navigation.Instance.setLocation(props.location.x, props.location.y);
        };

        Navigation.Instance.layers = this.layers;
    }

    layer(props: LayerType) {
        this.layers.push(new Layer(props, this.graphics));
    }
}