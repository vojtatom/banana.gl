import * as THREE from 'three';

const vs3D = `
attribute vec3 idcolor;
varying vec3 vidcolor;
void main(){
vidcolor = idcolor;
gl_Position = projectionMatrix * (modelViewMatrix * vec4( position, 1.0));
}`;

const fs3D = `
varying vec3 vidcolor;
void main(void) {
gl_FragColor = vec4(vidcolor,1.0);
}`;


export class GPUPicker {
    // create a 1x1 pixel render target
    private pickingTexture = new THREE.WebGLRenderTarget(1, 1);
    private pixelBuffer = new Uint8Array(4);
    private pickingScene = new THREE.Scene();
    private pickingMaterial = new THREE.ShaderMaterial({
            vertexShader: vs3D,
            fragmentShader: fs3D,
            transparent: false,
            side: THREE.DoubleSide
        });

    constructor(private renderer: THREE.WebGLRenderer, private camera: THREE.PerspectiveCamera) {}

    addPickable(mesh: THREE.Mesh) {
        const pickingObject = new THREE.Mesh(mesh.geometry, this.pickingMaterial);
        this.pickingScene.add(pickingObject);
    }

    pick(x: number, y: number) {
        // set the view offset to represent just a single pixel under the mouse
        const pixelRatio = this.renderer.getPixelRatio();
        this.camera.setViewOffset(
            this.renderer.getContext().drawingBufferWidth,
            this.renderer.getContext().drawingBufferHeight,
            x * pixelRatio | 0,
            y * pixelRatio | 0,
            1,
            1,
        );
        // render the scene
        this.renderer.setRenderTarget(this.pickingTexture);
        this.renderer.render(this.pickingScene, this.camera);
        this.renderer.setRenderTarget(null);

        // clear the view offset so rendering returns to normal
        this.camera.clearViewOffset();

        //read the pixel
        this.renderer.readRenderTargetPixels(
            this.pickingTexture,
            0,   // x
            0,   // y
            1,   // width
            1,   // height
            this.pixelBuffer);

        const id = (this.pixelBuffer[0] << 16) | (this.pixelBuffer[1] << 8) | (this.pixelBuffer[2]);
        return id;
    }
}

