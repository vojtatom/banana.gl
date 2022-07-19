

interface Job {
    data: any,
    jobID: number
}

interface Result {
    callback: CallableFunction
}


export class WorkerPool {
    private workers: Worker[];
    private worker_busy: boolean[];
    private jobIDs: number;
    private poolsize;
    protected queue: Job[];
    protected resultMap: Map<number, Result>;

    constructor(workerPath: string, poolsize?: number)
    {
        this.workers = [];
        this.worker_busy = [];
        this.jobIDs = 0;
        this.resultMap = new Map();
        this.poolsize = poolsize ?? 5;

        for(let i = 0; i < this.poolsize; ++i)
        {
            this.workers.push(new Worker(workerPath));
            this.worker_busy.push(false);
            

            this.workers[i].onmessage = (message) => {
                const {data} = message;
                const {result, jobID} = data;

                const res = this.resultMap.get(jobID);
                
                if (!res) 
                    return;

                res.callback(result);

                this.worker_busy[i] = false;
                this.submit();
            }
        }
        this.queue = [];
    }

    private get worker() {
        for (let i = 0; i < this.poolsize; ++i) {
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

        this.queue.push({
            data: data,
            jobID: jobID
        });

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