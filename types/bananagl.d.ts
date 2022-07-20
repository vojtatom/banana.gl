import { Graphics, GraphicsProps } from "./graphics";
import { Layer, LayerProps } from "./layer";
import { Style } from "./styles";
declare type BananaGLProps = {
    graphics: GraphicsProps;
    loaderPath?: string;
    stylerPath?: string;
    location?: {
        x: number;
        y: number;
        z: number;
    };
};
export declare class BananaGL {
    graphics: Graphics;
    layers: Layer[];
    constructor(props: BananaGLProps);
    loadLayer(props: LayerProps): void;
    get style(): Style;
}
export {};
