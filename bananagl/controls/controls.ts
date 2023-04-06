import { View } from '@bananagl/renderer/view';
import { Window } from '@bananagl/renderer/window';

import { ViewControls } from './viewControl';

export class WindowControls {
    private activeView_: View | null = null;
    private lastX_: number = 0;
    private lastY_: number = 0;
    private altKey_: boolean = false;

    constructor(private canvas: HTMLCanvasElement, private window: Window) {
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
        canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onMouseDown(event: MouseEvent) {
        const local = this.window.getViewAndPosition(event);
        if (!local) return;
        const { view, x, y } = local;
        this.activeView_ = view;
        this.lastX_ = x;
        this.lastY_ = y;
    }

    onMouseMove(event: MouseEvent) {
        if (!this.activeView_) return;
        const { offsetX, offsetY } = event;
        const dx = offsetX - this.lastX_;
        const dy = offsetY - this.lastY_;
        this.lastX_ = offsetX;
        this.lastY_ = offsetY;

        if (this.altKey_) {
            this.activeView_.camera.rotate(dx, dy);
        } else {
            this.activeView_.camera.pan(dx, dy);
        }
    }

    onMouseUp(event: MouseEvent) {
        if (!this.activeView_) return;
        this.activeView_ = null;
    }

    onMouseWheel(event: WheelEvent) {
        const local = this.window.getViewAndPosition(event);
        if (!local) return;
        const { view, lx, ly } = local;
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
        view.camera.zoom(factor, lx, ly);
    }

    onKeyDown(event: KeyboardEvent) {
        const { key } = event;
        if (key === 'Meta' || key === 'Alt') {
            this.altKey_ = true;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        const { key } = event;
        if (key === 'Meta' || key === 'Alt') {
            this.altKey_ = false;
        }
    }

    onContextMenu(event: MouseEvent) {
        //None yet
    }
}