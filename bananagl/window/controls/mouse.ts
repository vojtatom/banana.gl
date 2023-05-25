import { Shortcut } from '../shortcuts';
import { View } from '../view';
import { pan, rotate, trace, traceRange, zoom } from './calls';
import { KeyMap } from './keyboard';
import { RangeSelection } from './selection';

const LEFT = 0;
const MIDDLE = 1;
const RIGHT = 2;

export interface IMouseEvent {
    view: View;
    x: number;
    y: number;
    button: number;
    keyMap: KeyMap;
    moveShortcut?: Shortcut;
}

export interface IWheelEvent {
    view: View;
    delta: number;
    x: number;
    y: number;
}

export class MouseControls {
    private x: number = 0;
    private y: number = 0;
    private dpr: number = window.devicePixelRatio;
    private pressed = new Array(3).fill(false);
    private downAt: number = 0;
    private keyMap?: KeyMap;
    private view?: View;
    private range?: RangeSelection;

    down(event: IMouseEvent) {
        const { view, x, y, button, keyMap } = event;
        this.x = x;
        this.y = y;
        this.view = view;
        this.pressed[button] = true;
        this.keyMap = keyMap.clone();
        this.downAt = Date.now();

        if (event.moveShortcut && event.moveShortcut.onPress) {
            event.moveShortcut.onPress(event.view);
        }

        if (this.keyMap?.shift) {
            this.range = new RangeSelection(x, y);
        }
    }

    move(event: IMouseEvent) {
        const { x, y } = event;
        const dx = (x - this.x) * this.dpr;
        const dy = (y - this.y) * this.dpr;

        if (event.moveShortcut && event.moveShortcut.onMove) {
            event.moveShortcut.onMove(event.view, dx, dy);
        } else {
            this.handleMove(x, y, dx, dy);
        }

        this.x = x;
        this.y = y;
    }

    private handleMove(x: number, y: number, dx: number, dy: number) {
        if (!this.view) return;
        if (this.pressed[LEFT]) {
            if (this.keyMap?.shift) {
                this.range?.updateSelection(this.view, x, y);
            } else if (this.keyMap?.ctrl || this.keyMap?.alt) {
                rotate(this.view, dx, dy);
            } else {
                pan(this.view, dx, dy);
            }
        } else if (this.pressed[RIGHT] || this.pressed[MIDDLE]) {
            rotate(this.view, dx, dy);
        }
    }

    up(event: IMouseEvent) {
        if (!this.view) return null;
        const { x, y, button } = event;
        const duration = Date.now() - this.downAt;
        let hit = null;

        if (duration < 200) {
            hit = trace(this.view, x, y);
        } else if (this.keyMap?.shift && this.range) {
            console.log('there was a range select', this.range);
            hit = traceRange(this.view, this.range.from, this.range.to);
        }

        this.range?.dispose(this.view);
        this.pressed[button] = false;
        this.keyMap = undefined;
        this.view = undefined;
        return hit;
    }

    wheel(event: IWheelEvent) {
        zoom(event.view, event.delta, event.x, event.y);
    }

    out() {
        if (!this.view) return null;
        this.range?.dispose(this.view);
        this.pressed.fill(false);
        this.keyMap = undefined;
        this.view = undefined;
    }
}
