import * as THREE from 'three';


export class GPUPickHelper {
    pickingTexture: THREE.WebGLRenderTarget;
    pixelBuffer: Uint8Array;
    renderer: THREE.WebGLRenderer;

    selected: number[];
    id: number;

    offsets: Map<string, [number, number]>;
    maxOffest: number;


    constructor(renderer: THREE.WebGLRenderer) {
        // create a 1x1 pixel render target
        this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
        this.pixelBuffer = new Uint8Array(4);
        this.renderer = renderer;
        this.selected = [-1, -1, -1, -1];
        this.id = -1;
        this.offsets = new Map();
        this.maxOffest = 0;
    }

    registerLayer(name: string, size: number) {
        if (this.offsets.has(name))
            console.error(`Registering layer ${name} twice.`);

        this.offsets.set(name, [this.maxOffest, this.maxOffest + size]);
        this.maxOffest += size;
    }

    offsetForLayer(name: string) {
        if (!this.offsets.has(name))
            console.error(`Layer ${name} was not registered into the picker.`);
        let range = this.offsets.get(name);
        if (range)
            return range[0];
        return 0;
    }

    layerAndOidForId(id: number) {
        for (const [layer, range] of this.offsets.entries()) {
            if (id >= range[0] && id < range[1])
                return {
                    layer: layer,
                    oid: id - range[0]
                };
        }
    }

    pick(x: number, y: number, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
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
        this.renderer.setRenderTarget(pickingTexture)
        this.renderer.render(scene, camera);
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

        this.selected = [pixelBuffer[0] / 255, pixelBuffer[1] / 255, pixelBuffer[2] / 255, pixelBuffer[3] / 255];
        this.id = new DataView(pixelBuffer.buffer).getUint32(0, true);
        return this.id;
    }
}