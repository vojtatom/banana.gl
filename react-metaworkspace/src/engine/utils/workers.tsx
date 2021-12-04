

export function buildWorker(worker: any) {
    const code = worker.toString();
    const blob = new Blob([`(${code})()`]);
    return new Worker(URL.createObjectURL(blob));
}


export enum DecoderQueryType {
    float32 = 0,
    int32 = 1,
    uint8 = 2
}

let self: any;

export const Decoder = () => {
    const base64tofloat32 = (data: string) => {
        const s = atob(data);
        const buffer = new Float32Array(Uint8Array.from(s, c => c.charCodeAt(0)).buffer);
        return buffer;
    }

    const base64toint32 = (data: string, offset: number) => {
        const s = atob(data);
        const buffer = new Int32Array(Uint8Array.from(s, c => c.charCodeAt(0)).buffer);
        buffer.forEach((value, index) => buffer[index] = value + offset);
        return new Uint8Array(buffer.buffer);
    }

    const base64touint8 = (data: string) => {
        const s = atob(data);
        const buffer = Uint8Array.from(s, c => c.charCodeAt(0));
        return buffer;
    }

    self.onmessage = (message: MessageEvent) => {
        const data = message.data;
        const response: any = {
            jobID: data.jobID,
            resID: data.resID
        }

        switch (data.data.datatype) {
            case 0:
                response.buffer = base64tofloat32(data.data.buffer) as any;
                break;
            case 1:
                response.buffer = base64toint32(data.data.buffer, data.data.offset) as any;
                break;
            case 2:
                response.buffer = base64touint8(data.data.buffer) as any;
                break;
        }

        postMessage(response);
    }
}

const POOLSIZE = 20;

interface Job {
    data: any,
    jobID: number,
    resID: number
}

interface Result {
    data: any[];
    recieved: number;
    expected: number;
    callback: CallableFunction
}

export class Decoders {
    private static _instance: Decoders;
    private workers: Worker[];
    private worker_busy: boolean[];
    private queue: Job[];
    private jobIDs: number;
    private resultMap: Map<number, Result>;
    
    private constructor()
    {
        this.workers = [];
        this.worker_busy = [];
        this.jobIDs = 0;
        this.resultMap = new Map();

        for(let i = 0; i < POOLSIZE; ++i)
        {
            this.workers.push(buildWorker(Decoder));
            this.worker_busy.push(false);

            this.workers[i].onmessage = (message) => {
                const {data} = message;
                const {buffer, jobID, resID} = data;

                const res = this.resultMap.get(jobID);
                if (!res) 
                    return;
                res.data[resID] = buffer;
                res.recieved++;
                
                if (res.recieved === res.expected)
                {
                    res.callback(...res.data);
                    this.resultMap.delete(jobID);
                }

                this.worker_busy[i] = false;
                this.submit();
            }
        }
        this.queue = [];
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    private get worker() {
        for (let i = 0; i < POOLSIZE; ++i) {
            if (!this.worker_busy[i])
                return i;
        }
        return undefined;
    }

    process(data: any[], callback: (...output: any[]) => void) 
    {
        const jobID = this.jobIDs++;
        this.resultMap.set(jobID, {
            data: Array.apply(null, Array(data.length)).map(function () {}),
            recieved: 0,
            expected: data.length,
            callback: callback
        });

        for(let i = 0; i < data.length; ++i)
            this.queue.push({data: data[i], jobID: jobID, resID: i})

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
