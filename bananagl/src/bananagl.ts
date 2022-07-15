import { Vector3 } from "three";
import { Graphics, GraphicsProps } from "./graphics";
import { Layer, LayerProps } from "./layer";
import { LoaderWorkerPool } from "./loader";
import { Style, StylerWorkerPool } from "./styles";
import { Navigation } from "./navigation";

type BananaGLProps = {
    graphics: GraphicsProps
    loaderPath?: string;
    stylerPath?: string;
    location?: {
        x: number;
        y: number;
        z: number;
    };
}

export class BananaGL {
    graphics: Graphics;
    layers: Layer[] = [];

    constructor(props: BananaGLProps) {
        this.graphics = new Graphics(props.graphics);

        if (props.loaderPath)
            LoaderWorkerPool.workerPath = props.loaderPath;

        if (props.stylerPath)
            StylerWorkerPool.workerPath = props.stylerPath;

        if (props.location) {
            const position = new Vector3(props.location.x, props.location.y, props.location.z);
            const target = new Vector3(props.location.x, props.location.y, 0);
            Navigation.Instance.setLocation(position, target);
            this.graphics.focus(position, target);
        } else if (Navigation.Instance.isSet) {
            this.graphics.focus(Navigation.Instance.location, Navigation.Instance.target);
        }

        Navigation.Instance.layers = this.layers;

        this.graphics.onClick = (x: number, y: number, id: number) => {
            this.layers.forEach((layer) => {
                layer.select(id);
            });
        }

    }

    loadLayer(props: LayerProps) {
        this.layers.push(new Layer(props, this.graphics));
    }

    get style() {
        return new Style();
    }
}