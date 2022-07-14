import { Vector3, Vector2 } from "three";
import { Graphics, GraphicsProps } from "./graphics";
import { Layer, LayerProps } from "./layer";
import { Loaders } from "./loader";
import { Navigation } from "./navigation";
import { MaterialLibraryProps } from "./material";

type BananaGLProps = {
    graphics: GraphicsProps
    workerPath?: string;
    location?: {
        x: number;
        y: number;
    };
}

export class BananaGL {
    graphics: Graphics;
    layers: Layer[] = [];

    constructor(props: BananaGLProps) {
        this.graphics = new Graphics(props.graphics);

        if (props.workerPath) {
            Loaders.workerPath = props.workerPath;
        }

        if (props.location) {
            Navigation.Instance.setLocation(props.location.x, props.location.y);
            this.graphics.focus(props.location.x, props.location.y);
        } else if (Navigation.Instance.isSet) {
            this.graphics.focus(Navigation.Instance.location.x, Navigation.Instance.location.y);
        }

        Navigation.Instance.layers = this.layers;

        this.graphics.onClick = (x: number, y: number, id: number) => {
            this.layers.forEach((layer) => {
                layer.select(id);
            });
        }

    }

    layer(props: LayerProps) {
        this.layers.push(new Layer(props, this.graphics));
    }
}