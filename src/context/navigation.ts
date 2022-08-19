import * as THREE from 'three';
import { MapControls } from './mapControls';

export interface NavigationProps {
    target?: THREE.Vector3;
    location?: THREE.Vector3;
    offset?: number; 
}


function parseVector(str: string) {
    const [x, y, z] = str.split(',');
    return new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
}

function parseUrl() {
    const url = new URL(window.location.href);
    const location = url.searchParams.get('location');
    const target = url.searchParams.get('target');
    if (location && target) {
        return {
            location: parseVector(location),
            target: parseVector(target)
        };
    }

    return {
        location: new THREE.Vector3(Infinity, Infinity, Infinity),
        target: new THREE.Vector3(Infinity, Infinity, Infinity)
    };
}

function updateURL(location: THREE.Vector3, target: THREE.Vector3) {
    const url = new URL(window.location.href);
    const loc = `${location.x},${location.y},${location.z}`;
    const tar = `${target.x},${target.y},${target.z}`;
    url.searchParams.set('location', loc);
    url.searchParams.set('target', tar);

    window.history.pushState({}, '', url.href);
}


export interface Navigation {
    update: () => void;
    positionCameraIfNotSet: (target: THREE.Vector3, location?: THREE.Vector3 ) => void;
    set onchange(f: (target: THREE.Vector3, location?: THREE.Vector3 ) => void);
    get coordinates(): THREE.Vector3;
}

export function Navigation(props: NavigationProps, camera: THREE.Camera, controls: MapControls) : Navigation {
    let { location, target } = parseUrl();
    const onchangefs: CallableFunction[] = [];

    if (props.target && props.location) {
        target = props.target;
        location = props.location;
    } 
    
    positionCamera(target, location);

    const update = () => {
        updateURL(camera.position, controls.target);
        onchangefs.forEach(f => f(controls.target, camera.position));
    };
    
    const positionCameraIfNotSet = (target: THREE.Vector3, location?: THREE.Vector3) => {
        if (controls.target.equals(new THREE.Vector3(Infinity, Infinity, Infinity)))
            positionCamera(target, location);
    };
    
    return {
        update,
        positionCameraIfNotSet,
        set onchange(f: (target: THREE.Vector3, location?: THREE.Vector3 ) => void) {
            onchangefs.push(f);
        },
        get coordinates() {
            return controls.target.clone();
        }
    };

    function positionCamera(target: THREE.Vector3, location?: THREE.Vector3) {
        if (!location)
        {
            location = target.clone();
            const o = props.offset ?? 8000;
            const offset = new THREE.Vector3(-o, o, o);
            location.add(offset);
        }

        controls.target.copy(target);
        camera.position.copy(location);
        updateURL(camera.position, controls.target);
    }
}