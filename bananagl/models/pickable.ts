import { Model } from '@bananagl/models/model';
import { BVH } from '@bananagl/picking/bvh';
import { Ray } from '@bananagl/picking/ray';

export type OnPickCallback = (
    object: Pickable,
    primitiveIndex: number,
    ray: Ray,
    t: number
) => void;

export abstract class Pickable extends Model {
    protected bvh_?: BVH;
    protected onPick_?: OnPickCallback;

    set BVH(bvh: BVH | undefined) {
        this.bvh_ = bvh;
    }

    get BVH() {
        return this.bvh_;
    }

    get onPick() {
        return this.onPick_;
    }

    set onPick(callback: OnPickCallback | undefined) {
        this.onPick_ = callback;
    }
}
