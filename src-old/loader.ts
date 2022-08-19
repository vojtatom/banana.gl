import { WorkerPool } from './workerPool';


export class LoaderWorkerPool extends WorkerPool  {
    private static _instance: LoaderWorkerPool;
    static workerPath = 'loaderWorker.js';
    private idOffset = 0;
    
    private constructor()
    {
        super(LoaderWorkerPool.workerPath, 5);
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
