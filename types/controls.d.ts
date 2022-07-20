import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export declare class MapControls extends OrbitControls {
    lastPosition: THREE.Vector3;
    lastTarget: THREE.Vector3;
    mouseDownCnt: number;
    constructor(camera: THREE.Camera, domElement: HTMLCanvasElement);
    onMouseDown(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    get changed(): boolean;
}
