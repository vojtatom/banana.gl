import * as THREE from 'three';


export class Graphics {
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    scene: THREE.Scene;


    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.scene = new THREE.Scene();
    
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const frame = () => {
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(frame);
        }

        frame();
    }

    focus(x: number, y: number, z: number) {
        this.camera.position.set(x, y, z - 1000);
        this.camera.lookAt(new THREE.Vector3(x, y, z));
    }
} 


