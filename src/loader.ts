import { Layer } from './layer';
import axios from 'axios';
import { Vector3 } from 'three';
import { WorkerPool } from './workerPool';


export class LoaderWorkerPool extends WorkerPool  {
    private static _instance: LoaderWorkerPool;
    static workerPath = 'loaderWorker.js';
    private idOffset = 0;
    
    private constructor()
    {
        super(LoaderWorkerPool.workerPath, 10);
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    process(data: {file: string, objectsToLoad: number}, callback: (...output: any[]) => void) 
    {
        super.process({
            file: data.file,
            idOffset: this.idOffset
        }, callback);
        this.idOffset += data.objectsToLoad;
    }
}


type TileType = {
    x: number;
    y: number;
    file: string;
    size: number;
    loaded: boolean;
}


type LayoutType = {
    tileWidth: number;
    tileHeight: number;
    tiles: TileType[];
}


export class LayerLoader {
    private layer: Layer;
    private path: string;
    private layout!: LayoutType;

    constructor(layer: Layer, path: string) {
        this.layer = layer;
        this.path = path;
        this.getLayout();
    }

    private getLayout() {
        axios.get(`${this.path}/layout.json`).then((response) => {
            this.load(response.data);
        }).catch((error) => {
            console.error(`Could not load layout for layer ${this.path}`);
            console.error(error);
        });
    }

    locate(x: number, y: number) {
        const RADIUS = 2000 * 2000;
        if (this.layout) {
            const halfx = this.layout.tileWidth * 0.5;
            const halfy = this.layout.tileHeight * 0.5;
            this.layout.tiles.forEach((tile) => {
                const dx = tile.x * this.layout!.tileWidth + halfx - x;
                const dy = tile.y * this.layout!.tileHeight + halfy - y;
                const d = dx * dx + dy * dy;
                if (d < RADIUS) {
                    this.loadTile(tile);
                }
            });
        }
    }

    private load(layout: LayoutType) {
        this.layout = layout;

        function median(arr: number[]) {
            arr.sort();
            const mid = Math.floor(arr.length / 2);
            if (arr.length % 2)
                return arr[mid];
            return (arr[mid - 1] + arr[mid]) / 2;
        }

        const xmedian = median(this.layout.tiles.map((tile) => tile.x)) * this.layout.tileWidth;
        const ymedian = median(this.layout.tiles.map((tile) => tile.y)) * this.layout.tileHeight;
        const nav = this.layer.graphics.navigation;
        if (this.layer.graphics.navigation.isSet)
            this.locate(nav.target.x, nav.target.y);
        else {
            const position = new Vector3(xmedian, ymedian, 1000);
            const target = new Vector3(xmedian, ymedian, 0);
            this.layer.graphics.focus(position, target);
            nav.setLocation(position, target);
        }        
    }

    private loadTiles() {
        if (!this.layout)
            return;

        this.layout.tiles.forEach((tile) => {
            this.loadTile(tile);
        }
        );
    }

    private loadTile(tile: TileType) {
        if (tile.loaded)
            return;

        const mesh = this.layer.loadingPlaceholder(new Vector3(tile.x * this.layout.tileWidth, tile.y * this.layout.tileHeight, 0), new Vector3(this.layout.tileWidth, this.layout.tileHeight, 0));

        tile.loaded = true;
        const path = `${this.path}/${tile.file}`;
        const url = new URL(path, window.location.href);

        setTimeout(() => {
            LoaderWorkerPool.Instance.process({
                file: url.toString(),
                objectsToLoad: tile.size
            }, (scene) => {
                this.layer.graphics.scene.remove(mesh);
                this.layer.onDataLoaded(scene);
            });
        }, 500);
    }
}