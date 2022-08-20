import * as THREE from 'three';
import { Camera } from './mapControls';



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


export interface GPUPicker {
    get pickingScene(): THREE.Scene;
    addPickable(mesh: THREE.Mesh): void;
    pick(x: number, y: number): number;
}

export function GPUPicker(renderer: THREE.WebGLRenderer, camera: Camera): GPUPicker {
    // create a 1x1 pixel render target
    const pickingTexture = new THREE.WebGLRenderTarget(1, 1);
    const pixelBuffer = new Uint8Array(4);
    const pickingScene = new THREE.Scene();

    const pickingMaterial = new THREE.ShaderMaterial(
        {
            vertexShader: vs3D,
            fragmentShader: fs3D,
            transparent: false,
            side: THREE.DoubleSide
        });

    const addPickable = (mesh: THREE.Mesh) => {
        const pickingObject = new THREE.Mesh(mesh.geometry, pickingMaterial);
        pickingScene.add(pickingObject);
    };

    const pick = (x: number, y: number) => {
        // set the view offset to represent just a single pixel under the mouse
        const pixelRatio = renderer.getPixelRatio();
        camera.setViewOffset(
            renderer.getContext().drawingBufferWidth,
            renderer.getContext().drawingBufferHeight,
            x * pixelRatio | 0,
            y * pixelRatio | 0,
            1,
            1,
        );
        // render the scene
        renderer.setRenderTarget(pickingTexture);
        renderer.render(pickingScene, camera);
        renderer.setRenderTarget(null);

        // clear the view offset so rendering returns to normal
        camera.clearViewOffset();

        //read the pixel
        renderer.readRenderTargetPixels(
            pickingTexture,
            0,   // x
            0,   // y
            1,   // width
            1,   // height
            pixelBuffer);

        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
        return id;
    };

    return {
        get pickingScene() { return pickingScene; },
        addPickable,
        pick
    };
}