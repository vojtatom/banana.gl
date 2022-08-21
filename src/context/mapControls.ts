import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export type Camera = THREE.OrthographicCamera | THREE.PerspectiveCamera;


export interface MapControlsProps {
    minDistance? : number;
    maxDistance? : number;
    zoomSpeed? : number;
    minPolarAngle? : number;
    maxPolarAngle? : number;
}

function propDefaults(props: MapControlsProps) {
    props.minDistance = props.minDistance ?? 4000;
    props.maxDistance = props.maxDistance ?? 96000;
    props.zoomSpeed = props.zoomSpeed ?? 1;
    props.minPolarAngle = props.minPolarAngle ?? 0.001;
    props.maxPolarAngle = props.maxPolarAngle ?? Math.PI * 0.3;
}

export class MapControls extends OrbitControls {
    lastPosition = new THREE.Vector3();
    lastTarget = new THREE.Vector3();

    constructor(props: MapControlsProps, camera: Camera, domElement: HTMLCanvasElement) {
        camera.up = new THREE.Vector3(0, 0, 1);
        super(camera, domElement);
        propDefaults(props);
        this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up
        this.mouseButtons.LEFT = THREE.MOUSE.PAN;
        this.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
        this.mouseButtons.RIGHT = THREE.MOUSE.DOLLY;
        this.touches.ONE = THREE.TOUCH.PAN;
        this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
        this.zoomSpeed = props.zoomSpeed!;
        this.minDistance = props.minDistance!;
        this.maxDistance = props.maxDistance!;
        this.minPolarAngle = props.minPolarAngle!;
        this.maxPolarAngle = props.maxPolarAngle!;
        this.update();
    }
}