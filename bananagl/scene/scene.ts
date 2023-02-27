import { Renderable } from '@bananagl/models/renderable';

export class Scene {
    objects: Renderable[] = [];
    add(object: Renderable) {
        this.objects.push(object);
    }
}
