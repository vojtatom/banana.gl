import axios from 'axios';
import * as THREE from "three";
import { PointInstance } from '../../geometry/instance';

import { Layer } from "../../layer/layer";
import { Style } from '../../style/style';
import { Driver, DriverProps } from '../driver';
import { MetacityTile, MetacityTileProps } from "./tile";


export interface MetacityDriverProps extends DriverProps {
    pointInstance: string;
    styles: Style[];
    loadRadius: number;
    lodLimits: number[];
}

export class MetacityDriver implements Driver<MetacityDriverProps> {
    readonly api: string;
    private loadRadius: number;
    private lodLimits: number[];
    private tileWidth: number = 0;
    private tileHeight: number = 0;
    private tiles: MetacityTile[] = [];
    
    readonly styles: string[] = [];
    readonly pointInstance: PointInstance | undefined;

    constructor(props: MetacityDriverProps, readonly layer: Layer) {
        this.api = props.api as string;
        this.loadRadius = props.loadRadius ?? 2000;
        //this.loadRadiusSqr = Math.pow(this.loadRadius, 2);
        this.lodLimits = props.lodLimits ?? [20000];

        this.pointInstance = props.pointInstance ? new PointInstance(props.pointInstance) : undefined;
        this.styles = props.styles.map(s => s.serialize());
    }

    async init() {
        if (this.pointInstance)
            await this.pointInstance.load();

        const config = await axios.get(layoutUrl(this.api));
        this.tileWidth = config.data.tileWidth;
        this.tileHeight = config.data.tileHeight;
        this.tiles = config.data.tiles.map((t: MetacityTileProps) => new MetacityTile({
            ...t, 
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
            lodLimits: this.lodLimits
        }, this));
    }

    async updateView(target: THREE.Vector3, position: THREE.Vector3) {
        const tilesToLoad = this.tiles.filter((tile) => tile.distRect(target.x, target.y) < this.loadRadius);
        for (const tile of tilesToLoad) {
            tile.load(target, position);
        }
    }

    get center() {
        const xmedian = median(this.tiles.map((tile) => tile.x));
        const ymedian = median(this.tiles.map((tile) => tile.y));
        return new THREE.Vector3(
            xmedian * this.tileWidth,
            ymedian * this.tileHeight,
            0);
    }
}


function layoutUrl(base: string) {
    return `${base}/layout.json`;
}


export function median(arr: number[]) {
    arr.sort();
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2)
        return arr[mid];
    return (arr[mid - 1] + arr[mid]) / 2;
}