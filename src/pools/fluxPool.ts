import { InputData, ParsedData } from '../workers/flux/dataInterface';
import { WorkerPool } from './pool';


export class MetacityLoaderWorkerPool extends WorkerPool<InputData, ParsedData> {    
    constructor(workerPath: string)  {
        super(workerPath, 4);
    }

    load(data: InputData, callback: (output: ParsedData) => void) {
        super.process(data, callback);
    }
}
