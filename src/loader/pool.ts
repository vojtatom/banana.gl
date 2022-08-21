interface Job {
    data: any,
    jobID: number
}

interface QueueItem {
    next: QueueItem | undefined,
    value: Job
}

interface Queue  {
    enqueue(value: any): void;
    dequeue(): Job | undefined;
    peek(): Job | undefined;
}

export interface WorkerPool {
    process(data: any, callback: (...output: any[]) => void): void;
}

function Queue(): Queue {
    let head: QueueItem | undefined, tail: QueueItem;
    return Object.freeze({     
        enqueue(value: any) { 
            const link = { value, next: undefined };
            tail = head ? tail.next = link : head = link;
        },
        dequeue() {
            if (head) {
                const value = head.value;
                head = head.next;
                return value;
            }
        },
        peek() { return head?.value; }
    });
}

export function WorkerPool(workerPath: string, poolsize: number) {
    const workers: Worker[] = [];
    const worker_busy: boolean[] = [];
    let jobIDs = 0;
    const resultMap = new Map<number, CallableFunction>();
    const queue = Queue();

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

    const process = (data: any, callback: (...output: any[]) => void)  => {
        const jobID = jobIDs++;
        resultMap.set(jobID, callback);

        queue.enqueue({
            data: data,
            jobID: jobID
        });

        submit();
    };

    return {
        process
    };

    function getworker() {
        for (let i = 0; i < poolsize; ++i) {
            if (!worker_busy[i])
                return i;
        }
    }

    function submit() {
        const i = getworker();
        if (i === undefined)
            return;

        const job = queue.dequeue();
        if (!job)
            return;

        worker_busy[i] = true;
        workers[i].postMessage(job);
    }
}



