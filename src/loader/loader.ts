import { WorkerPool } from '../pool';
import { ParsedData } from './worker';


export interface LoaderWorkerPool {
    process(data: {file: string, objectsToLoad: number}, callback: (output: ParsedData) => void): void;
}

export function LoaderWorkerPool(workerPath: string, poolsize?: number): LoaderWorkerPool  {
    const pool = WorkerPool(workerPath, poolsize ?? 2);
    let idOffset = 0;

    const process = (data: {file: string, objectsToLoad: number}, callback: (output: ParsedData) => void) => {
        pool.process({
            file: data.file,
            idOffset: idOffset
        }, callback);
        idOffset += data.objectsToLoad;
    }

    return {
        process
    }
}
