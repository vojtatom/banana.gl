import axios from 'axios';
import * as THREE from "three";

import { Layer } from "../../layer";
import { Driver } from '../driver';
import { MetacityTile, MetacityTileProps } from "./tile";


export interface MetacityDriverProps {
    api: string;
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

    constructor(props: MetacityDriverProps, private layer: Layer) {
        this.api = props.api;
        this.loadRadius = props.loadRadius ?? 2000;
        this.lodLimits = props.lodLimits ?? [20000];
    }

    async init() {
        const config = await axios.get(layoutUrl(this.api));
        this.tileWidth = config.data.tileWidth;
        this.tileHeight = config.data.tileHeight;
        this.tiles = config.data.tiles.map((t: MetacityTileProps) => new MetacityTile({
            ...t, 
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
            lodLimits: this.lodLimits
        }, this.layer));
    }

    async updateView(target: THREE.Vector3, position: THREE.Vector3) {
        const tilesToLoad = this.tiles.filter((tile) => tile.dist(target.x, target.y) < this.loadRadius);
        await Promise.all(tilesToLoad.map((tile) => tile.load(target, position)));
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