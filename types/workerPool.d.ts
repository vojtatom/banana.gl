interface Job {
    data: any;
    jobID: number;
}
interface Result {
    callback: CallableFunction;
}
export declare class WorkerPool {
    private workers;
    private worker_busy;
    private jobIDs;
    private poolsize;
    protected queue: Job[];
    protected resultMap: Map<number, Result>;
    constructor(workerPath: string, poolsize?: number);
    private get worker();
    process(data: any, callback: (...output: any[]) => void): void;
    private submit;
}
export {};
