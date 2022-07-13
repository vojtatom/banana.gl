import { Layer } from "./layer";
import axios from "axios";
import { Navigation } from "./navigation";

const POOLSIZE = 5;


interface Job {
    file: string,
    jobID: number
}

interface Result {
    callback: CallableFunction
}


export class Loaders {
    private static _instance: Loaders;
    private workers: Worker[];
    private worker_busy: boolean[];
    private queue: Job[];
    private jobIDs: number;
    private resultMap: Map<number, Result>;
    static workerPath = "worker.js";
    
    private constructor()
    {
        this.workers = [];
        this.worker_busy = [];
        this.jobIDs = 0;
        this.resultMap = new Map();

        for(let i = 0; i < POOLSIZE; ++i)
        {
            this.workers.push(new Worker(Loaders.workerPath));
            this.worker_busy.push(false);

            this.workers[i].onmessage = (message) => {
                const {data} = message;
                const {geometry, jobID} = data;

                const res = this.resultMap.get(jobID);
                
                if (!res) 
                    return;

                res.callback(geometry);

                this.worker_busy[i] = false;
                this.submit();
            }
        }
        this.queue = [];
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    private get worker() {
        for (let i = 0; i < POOLSIZE; ++i) {
            if (!this.worker_busy[i])
                return i;
        }
        return undefined;
    }

    process(data: any, callback: (...output: any[]) => void) 
    {
        const jobID = this.jobIDs++;
        this.resultMap.set(jobID, {
            callback: callback
        });

        this.queue.push({file: data, jobID: jobID});
        this.submit();
    }

    private submit() {
        const i = this.worker;
        if (i === undefined)
            return;
        
        const job = this.queue.shift();
        if (!job)
            return;

        this.worker_busy[i] = true;
        this.workers[i].postMessage(job);
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
    private layout: LayoutType | undefined;

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
            console.log(error);
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
        if (Navigation.Instance.isSet)
            this.locate(Navigation.Instance.location.x, Navigation.Instance.location.y);
        else
            Navigation.Instance.setLocation(xmedian, ymedian);
        
    }

    private loadTile(tile: TileType): any {
        if (tile.loaded)
            return;

        tile.loaded = true;
        const path = `${this.path}/${tile.file}`;
        Loaders.Instance.process(path, (scene) => {
            this.layer.onDataLoaded(scene);
        });
    }
}