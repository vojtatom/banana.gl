import { Vector2 } from "three";
import { Layer } from "./layer";
import { Graphics } from "./graphics";


export class Navigation {
    location: Vector2;
    private static instance: Navigation;
    private layers_: Layer[] = [];

    private constructor() {
       //singleton
        const url = new URL(window.location.href);
        const location = url.searchParams.get("location");
        if (location) {
            this.location = new Vector2(parseFloat(location.split(",")[0]), parseFloat(location.split(",")[1]));
        } else {
            this.location = new Vector2(Infinity, Infinity);
        }

        console.log("Init with location:", this.location);
    }

    static get Instance() {
        if (!Navigation.instance)
            Navigation.instance = new Navigation();
        return Navigation.instance;
    }   

    setLocation(x: number, y: number) {
        this.location = new Vector2(x, y);
        this.updateURL();
        this.updateLayers();
    }

    get isSet() {
        return !this.location.equals(new Vector2(Infinity, Infinity));
    }

    set layers(layers: Layer[]) {
        this.layers_ = layers;
    }

    private updateURL() {
        const url = new URL(window.location.href);
        url.searchParams.set("location", `${this.location.x},${this.location.y}`);
        window.history.pushState({}, "", url.href);
    }

    private updateLayers() {
        this.layers_.forEach((layer) => {
            layer.locate(this.location.x, this.location.y);
        });
    }

    
}