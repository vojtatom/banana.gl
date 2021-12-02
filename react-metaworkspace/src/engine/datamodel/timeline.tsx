import { Renderer } from "../renderer/renderer";
import { ITimeline, IInterval } from "../types";
import { Layer, Overlay } from "./layer";
import { Interval } from "./interval"
import { ge, le } from "binary-search-bounds"

const LOADTIMEMARGIN = 2; //in seconds

export class Timeline {
    intervals: Interval[];
    intervalLength: number;
    isVisible: boolean;
    active: number;

    constructor(data: ITimeline, renderer: Renderer, layer: Layer | Overlay) {
        this.intervals = [];
        this.intervalLength = data.interval_length;
        this.active = -1;
        this.isVisible = true;

        for (const idata of data.intervals)
            this.intervals.push(new Interval(idata, this.intervalLength, renderer, layer));

        this.intervals.sort((a, b) => a.start - b.start)

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

    render(time: number) {
        if (!this.isVisible)
            return;

        //console.log(this.active, time);
        if (this.active !== -1) {
            //there is nothing to render in the active interval
            if (!this.intervals[this.active].contains(time))
                this.load(time);

            //be happy and render the interval you have in memory
            if (this.isTimeToPreload(time))
                this.preload(time);

            //render was succesfull
            this.intervals[this.active].render(time);
            return true;
        } else {
            //load the freaking interval, we need it rn
            return this.load(time);
        }
    }

    isTimeToPreload(time: number) {
        if (this.active === -1)
            return false;
        return time > (this.intervals[this.active].start + this.intervalLength - LOADTIMEMARGIN);
    }

    next(time: number) {
        const interval: number = ge(this.intervals, {start: time} as Interval, (a, b) => a.start - b.start);
        return interval;
    }

    current(time: number) {
        const interval: number = le(this.intervals, {start: time} as Interval, (a, b) => a.start - b.start);
        return interval;
    }

    preload(time: number) {
        const next = this.next(time);
        //possibly preload more intervals

        console.log("preloading", next);
        this.intervals[next].load();
    }
    
    load(time: number) {
        const i = this.current(time);
        if (i === -1)
            return;

        if (this.intervals[i].contains(time))
        {
            if (this.active !== -1)
                this.intervals[this.active].remove();
                
            if (this.intervals[i].init) {
                this.active = i;
            } else {
                this.active = i;
                console.log("hotloading", i);
                this.intervals[i].load();
            }
        }
    }

    hide() {
        this.visible = false;

        if (this.active === -1)
            return;

        this.intervals[this.active].hide();
    }

    show() {
        this.visible = true;
    }
}