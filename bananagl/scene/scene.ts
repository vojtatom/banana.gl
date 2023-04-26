import { Buffer } from '@bananagl/models/buffer';
import { Pickable } from '@bananagl/models/pickable';
import { Renderable } from '@bananagl/models/renderable';
import { TriangleBVH } from '@bananagl/picking/bvh.triangle';
import { PickerBVH } from '@bananagl/picking/pickerBVH';

export class Scene {
    readonly objects: Renderable[] = [];
    readonly pickerBVH = new PickerBVH(this);
    private onChanges: (() => void)[] = [];

    private opaqueObjects_: Renderable[] = [];
    private transparentObjects_: Renderable[] = [];
    private dirtyShaderOrder_ = false;

    add(object: Renderable, pickable = false) {
        this.objects.push(object);
        this.onChanges.forEach((callback) => callback());

        if (pickable) this.initTracing(object);
        this.dirtyShaderOrder_ = true;
    }

    remove(object: Renderable) {
        const idx = this.objects.indexOf(object);
        if (idx === -1) return;
        this.objects.splice(idx, 1);
        this.onChanges.forEach((callback) => callback());
        this.dirtyShaderOrder_ = true;
    }

    private initTracing(object: Renderable) {
        if (object instanceof Pickable) {
            //TODO: make this more generic
            console.warn('Assuming triangle mesh');
            const bvh = new TriangleBVH(object);
            object.BVH = bvh;
        }
    }

    sortByShader() {
        this.opaqueObjects_ = this.objects
            .filter((object) => !object.shader.transparency)
            .sort((a, b) => {
                const shaderA = a.shader;
                const shaderB = b.shader;
                if (shaderA === shaderB) return 0;
                return shaderA < shaderB ? -1 : 1;
            });

        this.transparentObjects_ = this.objects
            .filter((object) => object.shader.transparency)
            .sort((a, b) => {
                const shaderA = a.shader;
                const shaderB = b.shader;
                if (shaderA === shaderB) return 0;
                return shaderA < shaderB ? -1 : 1;
            });

        this.dirtyShaderOrder_ = false;
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

    set onChange(callback: () => void) {
        this.onChanges.push(callback);
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
