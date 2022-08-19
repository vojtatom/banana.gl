interface Job {
    data: any,
    jobID: number
}

export interface WorkerPool {
    process(data: any, callback: (...output: any[]) => void): void;
}

export function WorkerPool(workerPath: string, poolsize: number) {
    const workers: Worker[] = [];
    const worker_busy: boolean[] = [];
    let jobIDs = 0;
    const resultMap = new Map<number, CallableFunction>();
    const queue: Job[] = [];

    const process = (data: any, callback: (...output: any[]) => void)  => {
        const jobID = jobIDs++;
        resultMap.set(jobID, callback);

        queue.push({
            data: data,
            jobID: jobID
        });

        submit();
    };

    for (let i = 0; i < poolsize; ++i) {
        workers.push(new Worker(workerPath));
        worker_busy.push(false);
        workers[i].onmessage = (message) => {
            const { data } = message;
            const { result, jobID } = data;
            const callback = resultMap.get(jobID);
            if (callback) {
                callback(result);
                resultMap.delete(jobID);
            }
            worker_busy[i] = false;
            submit();
        };
    }

    return {
        process
    };

    function getworker() {
        for (let i = 0; i < poolsize; ++i) {
            if (!worker_busy[i])
                return i;
        }
        return undefined;
    }

    function submit() {
        const i = getworker();
        if (i === undefined)
            return;

        const job = queue.shift();
        if (!job)
            return;

        worker_busy[i] = true;
        workers[i].postMessage(job);
    }
}



