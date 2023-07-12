import { Buffer } from '@bananagl/models/buffer';
import { Renderable } from '@bananagl/models/renderable';
import { Picker } from '@bananagl/picking/picker';

export class Scene {
    readonly objects: Renderable[] = [];
    readonly toDispose: Renderable[] = [];
    readonly picker = new Picker(this);
    private onChangeCalls: (() => void)[] = [];

    private opaqueObjects_: Renderable[] = [];
    private transparentObjects_: Renderable[] = [];
    private noDepthObjects_: Renderable[] = [];
    private dirtyShaderOrder_ = false;

    add(object: Renderable, noSideEffects = false) {
        this.objects.push(object);
        if (!noSideEffects) this.onChangeCalls.forEach((callback) => callback());
        this.dirtyShaderOrder_ = true;
    }

    remove(object: Renderable, noSideEffects = false) {
        const idx = this.objects.indexOf(object);
        if (idx === -1) return;
        this.toDispose.push(...this.objects.splice(idx, 1));

        if (!noSideEffects) this.onChangeCalls.forEach((callback) => callback());
        this.dirtyShaderOrder_ = true;
    }

    removeDisposed(gl: WebGL2RenderingContext) {
        this.toDispose.forEach((object) => object.dispose(gl));
        this.toDispose.length = 0;
    }

    sortByShader() {
        this.opaqueObjects_ = this.objects
            .filter((object) => !object.shader.transparency && object.shader.depth)
            .sort((a, b) => {
                const shaderA = a.shader;
                const shaderB = b.shader;
                if (shaderA === shaderB) return 0;
                return shaderA < shaderB ? -1 : 1;
            });

        this.transparentObjects_ = this.objects
            .filter((object) => object.shader.transparency && object.shader.depth)
            .sort((a, b) => {
                const shaderA = a.shader;
                const shaderB = b.shader;
                if (shaderA === shaderB) return 0;
                return shaderA < shaderB ? -1 : 1;
            });

        this.noDepthObjects_ = this.objects
            .filter((object) => object.shader.depth === false)
            .sort((a, b) => {
                const shaderA = a.shader;
                const shaderB = b.shader;
                if (shaderA === shaderB) return 0;
                return shaderA < shaderB ? -1 : 1;
            });

        this.dirtyShaderOrder_ = false;
    }

    addChangeListener(callback: () => void) {
        this.onChangeCalls.push(callback);
    }

    removeChangeListener(callback: () => void) {
        const idx = this.onChangeCalls.indexOf(callback);
        if (idx === -1) return;
        this.onChangeCalls.splice(idx, 1);
    }

    get dirtyShaderOrder() {
        return this.dirtyShaderOrder_;
    }

    get opaqueObjects() {
        return this.opaqueObjects_;
    }

    get transparentObjects() {
        return this.transparentObjects_;
    }

    get noDepthObjects() {
        return this.noDepthObjects_;
    }

    set shadersChanged(value: boolean) {
        this.dirtyShaderOrder_ = value;
    }

    get bytesAllocated() {
        const bufferSet = new Set<Buffer>();
        let total = 0;
        for (const object of this.objects) {
            for (const buffer of object.attributes.buffers) {
                bufferSet.add(buffer);
            }
        }

        for (const buffer of bufferSet) {
            total += buffer.bytesAllocated;
        }

        return total;
    }
}
