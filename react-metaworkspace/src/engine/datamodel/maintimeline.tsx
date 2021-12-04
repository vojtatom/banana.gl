import { Renderer } from "../renderer/renderer";
import { Timeline } from "./timeline";



export class MainTimeline {
    renderer: Renderer;
    timelines: Timeline[];
    time: number;
    start: number;
    end: number;
    play: boolean;
    speed: number;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.timelines = [];
        this.time = 31740;
        this.start = Infinity;
        this.end = -Infinity;
        this.play = false;
        this.speed = 1;
    }

    addTimeline(timeline: Timeline) {
        this.timelines.push(timeline);
        this.start = Math.min(this.start, timeline.start);
        this.end = Math.max(this.end, timeline.end);
    }

    get ready() {
        for(const timeline of this.timelines)
            if (!timeline.ready)
                return false;
        return true;
    }

    tick() {
        const delta = (1 / 60) * this.speed;

        if (this.play && this.ready) {
            this.time += delta;
            this.renderer.matlib.setTime(this.time);
            this.renderer.changed = true;
        }
    
        this.render();
    }   
    
    render() {
        for(const timeline of this.timelines)
            timeline.render(this.time);
        this.renderer.changed = true;
    }
}

