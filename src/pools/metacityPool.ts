import { InputData, ParsedData, TileRequestData } from '../workers/metacity/dataInterface';
import { WorkerPool } from './pool';


export class MetacityLoaderWorkerPool extends WorkerPool<InputData, ParsedData> {
    idOffset = 0; 
    
    constructor(workerPath: string)  {
        super(workerPath, 4);
    }

    load(data: TileRequestData, callback: (output: ParsedData) => void) {
        super.process({
            file: data.file,
            idOffset: this.idOffset,
            styles: data.styles,
            baseColor: data.baseColor,
        }, callback);
        this.idOffset += data.objectsToLoad;
    }
}
