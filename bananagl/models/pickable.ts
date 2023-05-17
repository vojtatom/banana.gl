import { Model } from '@bananagl/models/model';
import { BVH } from '@bananagl/picking/bvh';
import { Ray } from '@bananagl/picking/ray';
import { TriangleBVH } from '@bananagl/picking/triangles/bvh.triangle';

export type OnPickCallback = (
    object: Pickable,
    primitiveIndex: number,
    ray: Ray,
    t: number,
    addToSelection?: boolean
) => void;

export abstract class Pickable extends Model {
    protected bvh_?: BVH;
    protected onPick_?: OnPickCallback;

    constructor() {
        super();
    }

    set BVH(bvh: BVH | undefined) {
        this.bvh_ = bvh;
    }

    get BVH() {
        return this.bvh_;
    }

    async initTrianglePicking() {
        const bvh = new TriangleBVH(this);
        await bvh.build();
        this.BVH = bvh;
    }

    get onPick() {
        return this.onPick_;
    }

    set onPick(callback: OnPickCallback | undefined) {
        this.onPick_ = callback;
    }
}
