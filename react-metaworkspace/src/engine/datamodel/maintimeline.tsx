import { Renderer } from "../renderer/renderer";
import { Timeline } from "./timeline";



export class MainTimeline {
    renderer: Renderer;
    timelines: Timeline[];
    time: number;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.timelines = [];
        this.time = 20000;
    }

    addTimeline(timeline: Timeline) {
        this.timelines.push(timeline);
    }

    tick() {
        const delta = 1 / 60;
        this.time += delta;
        this.renderer.matlib.setTime(this.time);
        this.renderer.changed = true;
    
        for(const timeline of this.timelines)
            timeline.render(this.time);
    }    
}

