import * as THREE from 'three';
import { CSM } from './csm/CSM';
import { MapControls } from './controls';


class PerspectiveControls {
    camera: THREE.PerspectiveCamera;
    controls!: MapControls;
    csm!: CSM;

    constructor(canvas: HTMLCanvasElement) {
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 6000)
    }

    update() {
        this.controls.update();
    }

    topView() {
        this.camera.position.copy(this.controls.target);
        this.camera.position.z = 3000;
        this.camera.updateMatrixWorld();
    }

    enable() {
        this.controls.enableRotate = true;
        this.controls.maxDistance = 5000;
    }
}


class OrthographicControls {
    camera: THREE.OrthographicCamera;
    controls!: MapControls;
    csm: CSM;

    constructor(canvas: HTMLCanvasElement, csm: CSM) {
        this.camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            -window.innerHeight / 2,
            1,
            8000);
        this.csm = csm;
    }

    update() {
        var size = this.controls.target.distanceTo( this.controls.object.position );
        var aspect = (this.controls.object as any).aspect;

        this.camera.left = size * aspect / -2;
        this.camera.right = size * aspect / 2;

        this.camera.top = size / 2;
        this.camera.bottom = size / - 2;

        this.camera.position.copy(this.controls.object.position);
        this.camera.updateProjectionMatrix();
        this.controls.update();
        this.csm.updateFrustums();
    }
    
    enable() {
        this.camera.position.copy( this.controls.object.position );
        this.controls.target.copy( this.camera.position );
        this.controls.target.z = 0;
        this.controls.maxDistance = 3000;
        this.controls.enableRotate = false;
    }

    topView() {
        this.camera.position.copy(this.controls.target);
        this.camera.position.z = 3000;
        this.camera.updateMatrixWorld()
    }
}

export class CameraControls {
    controls: MapControls;
    perspective: PerspectiveControls;
    orthographic?: OrthographicControls;
    current: PerspectiveControls | OrthographicControls;
    csm?: CSM;

    constructor(canvas: HTMLCanvasElement) {
        this.perspective = new PerspectiveControls(canvas);
        this.controls = new MapControls(this.perspective.camera, canvas);
        this.perspective.controls = this.controls;
        this.current = this.perspective;
        this.current.enable();
    }

    initOrthographic(canvas: HTMLCanvasElement, csm: CSM) {
        this.orthographic = new OrthographicControls(canvas, csm);
        this.orthographic.controls = this.controls;
        this.csm = csm;
    }

    update() {
        this.current.update();
    }

    enable() {
        this.current.enable();
    }

    topView() {
        this.current.topView();
    }

    get camera() {
        return this.current.camera;
    }

    get target() {
        return this.controls.target;
    }

    swap() {
        if (!this.orthographic || !this.csm)
            return; 

        this.current.topView();
        this.current = this.current === this.perspective ? this.orthographic : this.perspective;
        this.current.enable();

        this.csm.camera = this.current.camera;
        this.csm.updateFrustums();   
    }

    focus(focusPoint: THREE.Vector2) {
        this.current.controls.target = new THREE.Vector3(focusPoint.x, focusPoint.y, 0);
        this.current.camera.position.x = focusPoint.x;
        this.current.camera.position.y = focusPoint.y;
        this.current.camera.position.z = 1000;
    }

    screenToWorldOrthographic(x: number, y: number) {
        if ((this.current.camera as any).isOrthographicCamera)
        {
            const camera = this.current.camera as any;
            const vector = new THREE.Vector3();
            vector.set(
                (x / window.innerWidth) * 2 - 1,
                - (y / window.innerHeight) * 2 + 1,
                ( camera.near + camera.far ) / ( camera.near - camera.far )
            );
            return vector.unproject( camera );
        }
    }
}