import * as THREE from 'three';
import { MapControls, MapControlsProps } from './controls';


export interface NavigationProps extends MapControlsProps {
    target?: [number, number, number];
    position?: [number, number, number];
    offset?: number; 
    canvas: HTMLCanvasElement;
}


export class Navigation {
    private onchange_: CallableFunction[] = [];
    readonly controls: MapControls;
    private offset: number;

    constructor(props: NavigationProps) {
        let { position, target } = parseUrl();
        this.controls = new MapControls(props, props.canvas);
        this.offset = props.offset ?? 8000;

        target = target || props.target || [Infinity, Infinity, Infinity];        
        position = position || props.position || this.isoPosition(target);
        
        this.set(new THREE.Vector3(...target), new THREE.Vector3(...position));
    }

    set onchange(f: (target: THREE.Vector3, position: THREE.Vector3 ) => void) {
        this.onchange_.push(f);
    }

    get target() {
        return this.controls.target.clone();
    }

    get position() {
        return this.controls.camera.position.clone();
    }

    private get target_() {
        return this.controls.target;
    }

    private get position_() {
        return this.controls.camera.position;
    }

    get camera() {
        return this.controls.camera;
    } 

    update() {
        updateURL(this.controls.camera.position, this.controls.target);
        for(let i = 0; i < this.onchange_.length; i++)
            this.onchange_[i](this.target, this.position);
    };
    
    positionCameraIfNotSet(target: THREE.Vector3) {
        if (this.target_.equals(new THREE.Vector3(Infinity, Infinity, Infinity)))
            this.set(target, new THREE.Vector3(...this.isoPosition(target.toArray())));
    };

    private isoPosition(target: number[]) {
        const position = [...target];
        position[1] -= this.offset;
        position[2] += this.offset;
        return position;
    }

    private set(target: THREE.Vector3, position: THREE.Vector3) {
        this.controls.target.copy(target);
        this.controls.camera.position.copy(position);
        updateURL(this.position_, this.target_);
    }
}


function parseVector(str: string) {
    const [x, y, z] = str.split(',');
    return [ parseFloat(x), parseFloat(y), parseFloat(z) ];
}

function parseUrl() {
    const url = new URL(window.location.href);
    const position = url.searchParams.get('position');
    const target = url.searchParams.get('target');
    if (position && target) {
        return {
            position: parseVector(position),
            target: parseVector(target)
        };
    }

    return {
        position: undefined,
        target: undefined
    };
}

function updateURL(position: THREE.Vector3, target: THREE.Vector3) {
    const url = new URL(window.location.href);
    const loc = `${position.x},${position.y},${position.z}`;
    const tar = `${target.x},${target.y},${target.z}`;
    url.searchParams.set('position', loc);
    url.searchParams.set('target', tar);
    window.history.replaceState({}, '', url.href);
}