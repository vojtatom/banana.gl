import { Buffer } from '@bananagl/models/buffer';
import { Renderable } from '@bananagl/models/renderable';

export class Scene {
    objects: Renderable[] = [];
    add(object: Renderable) {
        this.objects.push(object);
    }

    get bytesAllocated() {
        const bufferSet = new Set<Buffer>();
        for (const object of this.objects) {
            for (const buffer of object.attributes.buffers) {
                bufferSet.add(buffer);
            }
        }
        let total = 0;
        for (const buffer of bufferSet) {
            total += buffer.bytesAllocated;
        }

        return total;
    }
}
