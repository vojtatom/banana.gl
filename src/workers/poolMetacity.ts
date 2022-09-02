import { WorkerPool } from './pool';
import { InputData, ParsedData } from './metacity-threejs/worker';


export type TileRequestData = {
    file: string, 
    objectsToLoad: number,
    styles: string[],
    baseColor: number,
};


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
