import { View } from '@bananagl/renderer/view';
import { Window } from '@bananagl/renderer/window';

export class WindowControls {
    private activeView_: View | null = null;
    private lastX_: number = 0;
    private lastY_: number = 0;
    private altKey_: boolean = false;
    private middleMouse_: boolean = false;
    private rightMouse_: boolean = false;
    private dpr_: number = window.devicePixelRatio;

    constructor(private canvas: HTMLCanvasElement, private window: Window) {
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
        canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
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

        if (event.button === 1) {
            this.middleMouse_ = true;
        }

        if (event.button === 2) {
            this.rightMouse_ = true;
        }

        event.preventDefault();
    }

    onMouseMove(event: MouseEvent) {
        if (!this.activeView_) return;
        const { offsetX, offsetY } = event;
        const dx = (offsetX - this.lastX_) * this.dpr_;
        const dy = (offsetY - this.lastY_) * this.dpr_;
        this.lastX_ = offsetX;
        this.lastY_ = offsetY;

        if (this.altKey_ || this.middleMouse_ || this.rightMouse_) {
            this.activeView_.cameraLock.restrictRotate(dx, dy);
            const { coords } = this.activeView_.cameraLock;
            this.activeView_.camera.rotate(coords[0], coords[1]);
        } else {
            this.activeView_.camera.pan(dx, dy);
        }
    }

    onMouseUp(event: MouseEvent) {
        this.finish(event.button);
    }

    onMouseWheel(event: WheelEvent) {
        const local = this.window.getViewAndPosition(event);
        if (!local) return;
        const { view, lx, ly } = local;
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
        view.camera.zoom(factor, lx, ly);
        event.preventDefault();
    }

    onKeyDown(event: KeyboardEvent) {
        const { key } = event;
        if (key === 'Meta' || key === 'Alt') {
            this.altKey_ = true;
        }
    }

    onMouseOut(event: MouseEvent) {
        const buttons = event.buttons;
        this.finish(buttons);
    }

    private finish(button: number) {
        if (!this.activeView_) return;
        this.activeView_ = null;
        if (button === 1 || button === -1) {
            this.middleMouse_ = false;
        }

        if (button === 2 || button === -1) {
            this.rightMouse_ = false;
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
        event.preventDefault();
    }
}
