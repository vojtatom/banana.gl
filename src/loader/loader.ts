import { WorkerPool } from '../pool';
import { ParsedData } from './worker';


type ProcessedData = {
    file: string, 
    objectsToLoad: number,
    styles: string[],
};

export interface LoaderWorkerPool {
    process(data: ProcessedData, callback: (output: ParsedData) => void): void;
}

export function LoaderWorkerPool(workerPath: string): LoaderWorkerPool  {
    const pool = WorkerPool(workerPath, 4);
    let idOffset = 0;

    const process = (data: ProcessedData, callback: (output: ParsedData) => void) => {
        pool.process({
            file: data.file,
            idOffset: idOffset,
            styles: data.styles
        }, callback);
        idOffset += data.objectsToLoad;
    };

    return {
        process
    };
}
