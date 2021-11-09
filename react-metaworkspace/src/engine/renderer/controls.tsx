import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export class MapControls extends OrbitControls {

    constructor(camera: THREE.Camera, domElement: HTMLCanvasElement) {

        camera.up = new THREE.Vector3(0, 0, 1);
        super(camera, domElement);

        this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

        this.mouseButtons.LEFT = THREE.MOUSE.PAN;
        this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

        this.touches.ONE = THREE.TOUCH.PAN;
        this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

        this.zoomSpeed = 0.5;
        this.dampingFactor = 0.1;
        this.enableDamping = true;
        this.minDistance = 400;
        this.minPolarAngle = 0.001;
        this.maxPolarAngle = Math.PI * 0.4;
        this.update();
    }
}