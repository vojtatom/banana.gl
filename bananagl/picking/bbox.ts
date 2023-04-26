import { vec3 } from 'gl-matrix';

import { TypedArray } from '@bananagl/shaders/shader';

export class BBox {
    min: vec3;
    max: vec3;
    constructor(min?: vec3, max?: vec3) {
        this.min = min || [Infinity, Infinity, Infinity];
        this.max = max || [-Infinity, -Infinity, -Infinity];
    }

    midpoint(dim: number): number {
        return (this.min[dim] + this.max[dim]) / 2;
    }

    get isEmpty(): boolean {
        return this.min[0] > this.max[0] || this.min[1] > this.max[1] || this.min[2] > this.max[2];
    }

    longestDim(): number {
        const [x, y, z] = this.max.map((v, i) => v - this.min[i]);
        if (x > y && x > z) return 0;
        if (y > x && y > z) return 1;
        return 2;
    }

    extend(x: number, y: number, z: number) {
        this.min[0] = Math.min(this.min[0], x);
        this.min[1] = Math.min(this.min[1], y);
        this.min[2] = Math.min(this.min[2], z);
        this.max[0] = Math.max(this.max[0], x);
        this.max[1] = Math.max(this.max[1], y);
        this.max[2] = Math.max(this.max[2], z);
    }

    extendArr(arr: TypedArray, startIdx: number, endIdx: number) {
        let x, y, z;
        const min = this.min;
        const max = this.max;
        for (let i = startIdx; i < endIdx; i += 3) {
            (x = arr[i]), (y = arr[i + 1]), (z = arr[i + 2]);
            min[0] = Math.min(min[0], x);
            min[1] = Math.min(min[1], y);
            min[2] = Math.min(min[2], z);
            max[0] = Math.max(max[0], x);
            max[1] = Math.max(max[1], y);
            max[2] = Math.max(max[2], z);
        }
    }

    contains(bbox: BBox): boolean {
        return (
            this.min[0] <= bbox.min[0] &&
            this.min[1] <= bbox.min[1] &&
            this.min[2] <= bbox.min[2] &&
            this.max[0] >= bbox.max[0] &&
            this.max[1] >= bbox.max[1] &&
            this.max[2] >= bbox.max[2]
        );
    }

    get longestSide(): number {
        const [x, y, z] = this.max.map((v, i) => v - this.min[i]);
        return Math.max(x, y, z);
    }

    longestSideScaled(scale: vec3): number {
        const [x, y, z] = this.max.map((v, i) => v - this.min[i]);
        return Math.max(x * scale[0], y * scale[1], z * scale[2]);
    }

    clone() {
        return new BBox(this.min.slice() as vec3, this.max.slice() as vec3);
    }

    distanceTo(point: vec3) {
        const [x, y, z] = point;
        const [minX, minY, minZ] = this.min;
        const [maxX, maxY, maxZ] = this.max;
        let dx = 0;
        let dy = 0;
        let dz = 0;
        if (x < minX) dx = x - minX;
        else if (x > maxX) dx = x - maxX;
        if (y < minY) dy = y - minY;
        else if (y > maxY) dy = y - maxY;
        if (z < minZ) dz = z - minZ;
        else if (z > maxZ) dz = z - maxZ;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}
