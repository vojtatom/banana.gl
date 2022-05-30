import iaxios from "../../axios";
import { Renderer } from "../renderer/renderer";
import { IInterval } from "../types";
import { Layer, Overlay } from "./layer";
import { Move } from "../geometry/movement"
import { deserializeMovement } from "../geometry/deserialize";
import { apiurl } from "../../url";

export class Interval {
    start: number;
    end: number;
    length: number;
    file: string;
    renderer: Renderer;
    layer: Layer | Overlay;
    moves: Move[];
    loading: boolean;
    init: boolean;
    acitve: number;
    delayedCall?: NodeJS.Timeout;

    constructor(data: IInterval, length: number, renderer: Renderer, layer: Layer | Overlay) {
        this.start = data.start_time;
        this.length = length;
        this.end = this.start + length;
        this.file = data.file;
        this.renderer = renderer;
        this.layer = layer;
        this.loading = false;
        this.init = false;
        this.delayedCall = undefined;
        this.acitve = -1;
        this.moves = []
    }

    load(callback: () => void) {
        if (this.loading || this.init)
            return false;
            
        this.loading = true;
        this.delayedCall = setTimeout(() => {
            this.delayedCall = undefined;
            this.renderer.status.actions.loadingGeometry.start();
            iaxios.get(`${apiurl.PROJECTDATA}${this.layer.project}/${this.layer.name}/timeline/stream/${this.file}`).then(
                (response) => {
                    const data = response.data;
                    this.renderer.status.actions.loadingGeometry.stop();
                    this.renderer.status.actions.parsingGeometry.start();
                    deserializeMovement(data, this, (move: Move) => {
                        this.moves.push(move);
                        move.visible = false;
                        if (this.moves.length === this.length)
                        {
                            this.renderer.status.actions.parsingGeometry.stop();
                            this.finalizeInit();
                            callback();
                        }
                    }, () => false);
                }
            )    
        }, 1000);

        return true;
    }

    finalizeInit() {
        this.moves.sort((a, b) => a.time - b.time);
        this.init = true;
        this.loading = false;
    }

    render(time: number) {
        if (!this.init)
            return;

        const current = Math.floor(time) - this.start;
        if (this.acitve === current)
            return;

        //do swap
        if (this.acitve !== -1)
            this.moves[this.acitve].visible = false;

        if (current >= this.moves.length)
            return;
            
        this.moves[current].visible = true;
        this.acitve = current;
    }

    contains(time: number) {
        return time >= this.start && time < this.end; 
    }

    remove() {
        for(const move of this.moves)
            move.remove();

        if (this.delayedCall)
            clearTimeout(this.delayedCall);
        
        this.loading = false;
        this.init = false;
        this.moves = [];
    }

    hide() {
        if (this.acitve === -1)
            return;

        this.moves[this.acitve].visible = false;
    }

    show() {
        if (this.acitve === -1)
            return;

        this.moves[this.acitve].visible = true;
    }
}