import * as THREE from 'three';
import { MapControls } from './mapControls';

export interface NavigationProps {
    target?: [number, number, number];
    position?: [number, number, number];
    offset?: number; 
}


function parseVector(str: string) {
    const [x, y, z] = str.split(',');
    return new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
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
        position: new THREE.Vector3(Infinity, Infinity, Infinity),
        target: new THREE.Vector3(Infinity, Infinity, Infinity)
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


export interface Navigation {
    update: () => void;
    positionCameraIfNotSet: (target: THREE.Vector3, position?: THREE.Vector3 ) => void;
    set onchange(f: (target: THREE.Vector3, position?: THREE.Vector3 ) => void);
    get target(): THREE.Vector3;
    get position(): THREE.Vector3;
}

export function Navigation(props: NavigationProps, camera: THREE.Camera, controls: MapControls) : Navigation {
    let { position, target } = parseUrl();
    const onchangefs: CallableFunction[] = [];

    if (props.target && position.equals(new THREE.Vector3(Infinity, Infinity, Infinity))) {
        target = new THREE.Vector3(...props.target);
        if (props.position)
            position = new THREE.Vector3(...props.position);
        else 
            position = null as any;
    } 
    
    positionCamera(target, position);

    const update = () => {
        updateURL(camera.position, controls.target);
        onchangefs.forEach(f => f(controls.target, camera.position));
    };
    
    const positionCameraIfNotSet = (target: THREE.Vector3, position?: THREE.Vector3) => {
        if (controls.target.equals(new THREE.Vector3(Infinity, Infinity, Infinity)))
            positionCamera(target, position);
    };
    
    return {
        update,
        positionCameraIfNotSet,
        set onchange(f: (target: THREE.Vector3, position?: THREE.Vector3 ) => void) {
            onchangefs.push(f);
        },
        get target() {
            return controls.target.clone();
        },
        get position() {
            return camera.position.clone();
        }
    };

    function positionCamera(target: THREE.Vector3, position?: THREE.Vector3) {
        console.log('positionCamera', target, position);
        if (!position)
        {
            position = target.clone();
            const o = props.offset ?? 8000;
            const offset = new THREE.Vector3(-o, o, o);
            position.add(offset);
        }

        controls.target.copy(target);
        camera.position.copy(position);
        updateURL(camera.position, controls.target);
    }
}