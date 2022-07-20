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
    pickingTexture: THREE.WebGLRenderTarget;
    pixelBuffer: Uint8Array;
    renderer: THREE.WebGLRenderer;
    pickingScene: THREE.Scene;
    pickingMaterial: THREE.ShaderMaterial;
    id: number;

    constructor(renderer: THREE.WebGLRenderer) {
        // create a 1x1 pixel render target
        this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
        this.pixelBuffer = new Uint8Array(4);
        this.renderer = renderer;
        this.id = -1;

        this.pickingScene = new THREE.Scene();

        this.pickingMaterial = new THREE.ShaderMaterial(
            {
                vertexShader: vs3D,
                fragmentShader: fs3D,
                transparent: false,
                side: THREE.DoubleSide
            });
    }

    addPickable(mesh: THREE.Mesh) {
        const pickingObject = new THREE.Mesh(mesh.geometry, this.pickingMaterial);
        this.pickingScene.add(pickingObject);
    }


    pick(x: number, y: number, camera: THREE.OrthographicCamera | THREE.PerspectiveCamera) {
        const { pickingTexture, pixelBuffer } = this;

        // set the view offset to represent just a single pixel under the mouse
        const pixelRatio = this.renderer.getPixelRatio();
        camera.setViewOffset(
            this.renderer.getContext().drawingBufferWidth,
            this.renderer.getContext().drawingBufferHeight,
            x * pixelRatio | 0,
            y * pixelRatio | 0,
            1,
            1,
        );
        // render the scene
        this.renderer.setRenderTarget(pickingTexture);
        this.renderer.render(this.pickingScene, camera);
        this.renderer.setRenderTarget(null);

        // clear the view offset so rendering returns to normal
        camera.clearViewOffset();

        //read the pixel
        this.renderer.readRenderTargetPixels(
            pickingTexture,
            0,   // x
            0,   // y
            1,   // width
            1,   // height
            pixelBuffer);

        this.id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
    }
}