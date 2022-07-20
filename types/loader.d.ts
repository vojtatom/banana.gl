import { Layer } from "./layer";
import { WorkerPool } from "./workerPool";
export declare class LoaderWorkerPool extends WorkerPool {
    private static _instance;
    static workerPath: string;
    private idOffset;
    private constructor();
    static get Instance(): LoaderWorkerPool;
    process(data: {
        file: string;
        objectsToLoad: number;
    }, callback: (...output: any[]) => void): void;
}
export declare class LayerLoader {
    private layer;
    private path;
    private layout;
    constructor(layer: Layer, path: string);
    private getLayout;
    locate(x: number, y: number): void;
    private load;
    private loadTile;
}
