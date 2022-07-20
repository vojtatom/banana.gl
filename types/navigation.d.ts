import { Vector3 } from "three";
import { Layer } from "./layer";
export declare class Navigation {
    location: Vector3;
    target: Vector3;
    private layers_;
    constructor();
    setLocation(position: Vector3, target: Vector3): void;
    get isSet(): boolean;
    set layers(layers: Layer[]);
    private updateURL;
    private updateLayers;
}
