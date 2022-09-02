import { PlaceholderMeshModel } from "../../geometry/placeholder";
import { Layer } from "../../layer/layer";
import { MetacityTileLOD } from "./lod";


export interface MetacityTileProps {
    x: number;
    y: number;
    file: string;
    size: number;
    tileWidth: number;
    tileHeight: number;
    lodLimits: number[];
}

export class MetacityTile {
    readonly x: number;
    readonly y: number;
    readonly size: number;
    readonly width: number;
    readonly height: number;
    readonly lodLimits: number[];
    readonly lods: MetacityTileLOD[] = [];
    readonly url: string;

    private placeholder: THREE.Mesh | undefined;
    
    readonly cx: number;
    readonly cy: number;

    constructor(props: MetacityTileProps, layer: Layer) {
        this.x = props.x;
        this.y = props.y;
        this.size = props.size;
        this.width = props.tileWidth;
        this.height = props.tileHeight;
        this.lodLimits = props.lodLimits;
        this.url = `${layer.api}/${props.file}`;
        this.cx = (this.x + 0.5) * this.width;
        this.cy = (this.y + 0.5) * this.height;

        for(let i = 0; i < this.lodLimits.length + 1; i++)
            this.lods.push(new MetacityTileLOD(this, layer, i));

        this.placeholder = new PlaceholderMeshModel(this.cx, this.cy, this.width, this.height, layer.materials);
        layer.ctx.scene.add(this.placeholder);
    }

    async load(target: THREE.Vector3, position: THREE.Vector3) {
        if (this.placeholder) {
            this.placeholder.parent?.remove(this.placeholder);
            this.placeholder = undefined;
        }

        const lodIndex = this.computeLOD(target, position);
        this.toggleLOD(lodIndex);
    }

    distSqr(x: number, y: number, z?: number) {
        const dx = this.cx - x;
        const dy = this.cy - y;
        const dz = z ? z : 0;
        return dx * dx + dy * dy + dz * dz;
    }

    distRect(x: number, y: number) {
        const dx = Math.abs(this.cx - x);
        const dy = Math.abs(this.cy - y);
        return Math.max(dx, dy);
    }


    //higher distance => lower LOD, the limits have to be sorted from the lowest to the highest
    private computeLOD(target: THREE.Vector3, position: THREE.Vector3) {
        const dist = this.distSqr(position.x, position.y, position.z);
        const lod = this.lodLimits.findIndex((limit) => dist < limit * limit);
        if (lod === -1)
            return 0;
        return lod + 1;
    }

    private toggleLOD(visibleLOD: number) {
        for(let i = 0; i < this.lods.length; i++)
            this.lods[i].visible = i === visibleLOD;
    }
}