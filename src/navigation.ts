import { Vector3 } from 'three';
import { Layer } from './layer';
import { Graphics } from './graphics';


export class Navigation {
    location: Vector3;
    target: Vector3;
    private layers_: Layer[] = [];

    constructor() {
        const url = new URL(window.location.href);
        const location = url.searchParams.get('location');
        const target = url.searchParams.get('target');
        if (location && target) {
            const [x, y, z] = location.split(',');
            this.location = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
            const [tx, ty, tz] = target.split(',');
            this.target = new Vector3(parseFloat(tx), parseFloat(ty), parseFloat(tz));
        } else {
            this.location = new Vector3(Infinity, Infinity, Infinity);
            this.target = new Vector3(Infinity, Infinity, Infinity);
        }

        console.log('Init with location:', this.location);
    }

    setLocation(position: Vector3, target: Vector3) {
        this.location.copy(position);
        this.target.copy(target);
        this.updateURL();
        this.updateLayers();
    }

    get isSet() {
        return !this.location.equals(new Vector3(Infinity, Infinity, Infinity));
    }

    set layers(layers: Layer[]) {
        this.layers_ = layers;
    }

    private updateURL() {
        const url = new URL(window.location.href);
        url.searchParams.set('location', `${this.location.x},${this.location.y},${this.location.z}`);
        url.searchParams.set('target', `${this.target.x},${this.target.y},${this.target.z}`);
        window.history.pushState({}, '', url.href);
    }

    private updateLayers() {
        this.layers_.forEach((layer) => {
            layer.locate(this.location.x, this.location.y);
        });
    }

    
}