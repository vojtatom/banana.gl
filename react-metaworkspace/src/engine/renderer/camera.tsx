import * as THREE from 'three';
import { CSM } from './csm/CSM';
import { MapControls } from './controls';


class PerspectiveControls {
    camera: THREE.PerspectiveCamera;

    constructor(canvas: HTMLCanvasElement) {
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 6000)
    }

    update(controls: MapControls) {
        controls.update();
    }

    topView(controls: MapControls) {
        this.camera.position.copy(controls.target);
        this.camera.position.z = 3000;
        this.camera.updateMatrixWorld();
    }

    enable(controls: MapControls) {
        controls.enableRotate = true;
        controls.maxDistance = 5000;
    }

    resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}


class OrthographicControls {
    camera: THREE.OrthographicCamera;
    csm: CSM;

    constructor(canvas: HTMLCanvasElement, csm: CSM) {
        this.camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            -window.innerHeight / 2,
            1,
            10000);
        this.csm = csm;
    }

    update(controls: MapControls) {
        var size = controls.target.distanceTo( controls.object.position );
        var aspect = (controls.object as any).aspect;

        this.camera.left = size * aspect / -2;
        this.camera.right = size * aspect / 2;

        this.camera.top = size / 2;
        this.camera.bottom = size / - 2;

        this.camera.position.copy(controls.object.position);
        this.camera.updateProjectionMatrix();
        controls.update();
        this.csm.updateFrustums();
    }
    
    enable(controls: MapControls) {
        this.camera.position.copy( controls.object.position );
        controls.target.copy( this.camera.position );
        controls.target.z = 0;
        controls.maxDistance = 10000;
        controls.enableRotate = false;
    }

    topView(controls: MapControls) {
        this.camera.position.copy(controls.target);
        this.camera.position.z = 3000;
        this.camera.updateMatrixWorld()
    }

    resize(width: number, height: number) {
        this.camera.left = -width / 2;
        this.camera.right = width / 2;

        this.camera.top = height / 2;
        this.camera.bottom = -height / 2;

        this.camera.updateProjectionMatrix();
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
        this.current = this.perspective;
        this.current.enable(this.controls);
    }

    initOrthographic(canvas: HTMLCanvasElement, csm: CSM) {
        this.orthographic = new OrthographicControls(canvas, csm);
        this.csm = csm;
    }

    resize(x: number, y: number){
        this.perspective.resize(x, y);
        if(this.orthographic)
            this.orthographic.resize(x, y);
    }

    update() {
        this.current.update(this.controls);
    }

    enable() {
        this.current.enable(this.controls);
    }

    topView() {
        this.current.topView(this.controls);
    }

    get camera() {
        return this.current.camera;
    }

    get target() {
        return this.controls.target;
    }

    useOrtho() {
        if (!this.orthographic)
            return;

        if (this.current === this.orthographic)
            return;
        
        this.swap();
    }

    usePerspective() {
        if (this.current === this.perspective)
            return;
        
        this.swap();
    }

    swap() {
        if (!this.orthographic || !this.csm)
            return; 

        this.current.topView(this.controls);
        this.current = this.current === this.perspective ? this.orthographic : this.perspective;
        this.current.enable(this.controls);

        this.csm.camera = this.current.camera;
        this.csm.updateFrustums();   
    }

    focus(focusPoint: THREE.Vector2) {
        const usingOrtho = (this.current.camera as any).isOrthographicCamera;

        if (usingOrtho)
            this.swap();

        this.controls.target = new THREE.Vector3(focusPoint.x, focusPoint.y, 0);
        this.perspective.camera.position.x = focusPoint.x;
        this.perspective.camera.position.y = focusPoint.y;
        this.perspective.camera.position.z = 1000;

        if (usingOrtho)
            this.swap();
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