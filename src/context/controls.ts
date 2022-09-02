import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface MapControlsProps {
    near?: number;
    far?: number;
    minDistance?: number;
    maxDistance?: number;
    zoomSpeed?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
}

export class MapControls extends OrbitControls {
    readonly camera: THREE.PerspectiveCamera;

    constructor(props: MapControlsProps, domElement: HTMLCanvasElement) {
        const camera = new THREE.PerspectiveCamera(
            5,
            domElement.clientWidth / domElement.clientHeight,
            props.near ?? 1000,
            props.far ?? 100000
        );
        camera.up.set(0, 0, 1);
        super(camera, domElement);
        this.camera = camera;
        this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up
        this.mouseButtons.LEFT = THREE.MOUSE.PAN;
        this.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
        this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        this.touches.ONE = THREE.TOUCH.PAN;
        this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
        this.zoomSpeed = props.zoomSpeed ?? 1;
        this.minDistance = props.minDistance ?? 4000;
        this.maxDistance = props.maxDistance ?? 96000;
        this.minPolarAngle = props.minPolarAngle ?? 0.001;
        this.maxPolarAngle = props.maxPolarAngle ?? Math.PI * 0.3;
        this.update();
    }

    updateCamera(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}