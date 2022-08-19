import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export class MapControls extends OrbitControls {
    lastPosition = new THREE.Vector3();
    lastTarget = new THREE.Vector3();

    constructor(camera: THREE.Camera, domElement: HTMLCanvasElement) {
        camera.up = new THREE.Vector3(0, 0, 1);
        super(camera, domElement);

        this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up
        this.mouseButtons.LEFT = THREE.MOUSE.PAN;
        this.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
        this.mouseButtons.RIGHT = THREE.MOUSE.DOLLY;
        this.touches.ONE = THREE.TOUCH.PAN;
        this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
        this.zoomSpeed = 1.0;
        this.minDistance = 400;
        this.minPolarAngle = 0.001;
        this.maxPolarAngle = Math.PI * 0.4;
        this.update();
    }
}