import * as THREE from 'three';
export declare class GPUPicker {
    pickingTexture: THREE.WebGLRenderTarget;
    pixelBuffer: Uint8Array;
    renderer: THREE.WebGLRenderer;
    pickingScene: THREE.Scene;
    pickingMaterial: THREE.ShaderMaterial;
    id: number;
    constructor(renderer: THREE.WebGLRenderer);
    addPickable(mesh: THREE.Mesh): void;
    pick(x: number, y: number, camera: THREE.OrthographicCamera | THREE.PerspectiveCamera): void;
}
