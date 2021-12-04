import { Renderer } from "../renderer/renderer";
import { ITimeline, IInterval } from "../types";
import { Layer, Overlay } from "./layer";
import { Interval } from "./interval"
import { ge, le } from "binary-search-bounds"

const MINPRELOAD = 2;
const PRELOADI = 5;
const LOADTIMEMARGIN = PRELOADI * 60; //in seconds

enum LoadStatus {
    loading,
    wontload,
    loaded
};

export class Timeline {
    intervals: Interval[];
    intervalLength: number;
    isVisible: boolean;
    active: number;
    start: number;
    end: number;
    fillingBuffer: boolean;

    loaded: Map<number, LoadStatus>;

    constructor(data: ITimeline, renderer: Renderer, layer: Layer | Overlay) {
        this.intervals = [];
        this.intervalLength = data.interval_length;
        this.active = -1;
        this.isVisible = true;

        this.fillingBuffer = true;
        this.loaded = new Map();

        for (const idata of data.intervals)
            this.intervals.push(new Interval(idata, this.intervalLength, renderer, layer));

        this.intervals.sort((a, b) => a.start - b.start)
        this.start = this.intervals[0].start;
        this.end = this.intervals[this.intervals.length - 1].start + this.intervalLength;

        renderer.timeline.addTimeline(this);
    }

    set visible(isVisible: boolean) {
        if (this.isVisible === isVisible)
            return;

        this.isVisible = isVisible;

        if (isVisible)
            this.show();
        else
            this.hide();
    }

    get countLoaded() {
        let count = 0;
        for (const status of this.loaded.values())
            if (status !== LoadStatus.loading)
                count++;
        return count;
    }

    get ready() {
        const cl = this.countLoaded;

        if (this.fillingBuffer){
            if (cl >= MINPRELOAD)
            {
                this.fillingBuffer = false;
                return true;
            }
            return false;
        }
        return cl >= MINPRELOAD;
    }

    render(time: number) {
        if (!this.isVisible)
            return;

        this.updateLoaded(time);  

        if (!this.intervals[this.active] || !this.intervals[this.active].contains(time))
            this.swapActive(time);

        if (this.active !== -1)
            this.intervals[this.active].render(time);
    }


    updateLoaded(time: number) {
        const current = this.current(time);
        for (let i = current; i < current + PRELOADI; i++)
            this.loadInterval(i);
        this.discard(current);
    }

    swapActive(time: number) {
        const i = this.current(time);
        this.active = -1;
        if (this.intervals[i].init) {
            this.active = i;
        }
    }

    private current(time: number) {
        const interval: number = le(this.intervals, {start: time} as Interval, (a, b) => a.start - b.start);
        return interval;
    }

    private loadInterval(index: number) {
        const interval = this.intervals[index];

        if (!interval) {
            this.loaded.set(index, LoadStatus.wontload);
            return;
        }
        
        if (interval.init || interval.loading){
            return;
        }

        this.loaded.set(index, LoadStatus.loading);
        
        const loading = interval.load(() => {
            this.loaded.set(index, LoadStatus.loaded);
        });
    }

    private discard(nowIndex: number) {        
        for (const index of this.loaded.keys()) {
            if (index < nowIndex || index >= nowIndex + PRELOADI)
                this.unloadInterval(index);
        }
    }

    private unloadInterval(index: number) {
        if (this.loaded.get(index) !== LoadStatus.wontload)
            this.intervals[index].remove();
        this.loaded.delete(index);
    }

    hide() {
        this.visible = false;

        if (this.active === -1)
            return;

        this.intervals[this.active].hide();
    }

    show() {
        this.visible = true;

        if (this.active === -1)
            return;

        this.intervals[this.active].show();
    }
}