import { View } from '@bananagl/window/view';
import { Window } from '@bananagl/window/window';

export class WindowControls {
    private activeView_: View | null = null;
    private lastX_: number = 0;
    private lastY_: number = 0;
    private altKey_: boolean = false;
    private shiftKey_: boolean = false;
    private middleMouse_: boolean = false;
    private rightMouse_: boolean = false;
    private dpr_: number = window.devicePixelRatio;
    private downTime_: number = 0;

    constructor(private canvas: HTMLCanvasElement, private window: Window) {
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mousemove', this.onMouseMove);
        canvas.addEventListener('mouseup', this.onMouseUp);
        canvas.addEventListener('wheel', this.onMouseWheel);
        canvas.addEventListener('mouseout', this.onMouseOut);
        canvas.addEventListener('contextmenu', this.onContextMenu);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    dispose() {
        const canvas = this.canvas;
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('mousemove', this.onMouseMove);
        canvas.removeEventListener('mouseup', this.onMouseUp);
        canvas.removeEventListener('wheel', this.onMouseWheel);
        canvas.removeEventListener('mouseout', this.onMouseOut);
        canvas.removeEventListener('contextmenu', this.onContextMenu);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    onMouseDown = (event: MouseEvent) => {
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

        this.downTime_ = Date.now();
        event.preventDefault();
    };

    onMouseMove = (event: MouseEvent) => {
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
    };

    onMouseUp = (event: MouseEvent) => {
        if (Date.now() - this.downTime_ < 200) {
            if (!this.activeView_) return;
            console.log('click');
            const { offsetX, offsetY } = event;
            const ndc = this.activeView_.toNDC(offsetX, offsetY);
            const ray = this.activeView_.camera.primaryRay(ndc[0], ndc[1]);
            const hit = this.activeView_.scene.pickerBVH.trace(ray);
            if (hit && hit.object.onPick)
                hit.object.onPick(hit.object, hit.primitiveIndex, ray, hit.t, this.shiftKey_);
        }

        this.finish(event.button);
    };

    onMouseWheel = (event: WheelEvent) => {
        const local = this.window.getViewAndPosition(event);
        if (!local) return;
        const { view, lx, ly } = local;
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
        view.camera.zoom(factor, lx, ly);
        event.preventDefault();
    };

    onKeyDown = (event: KeyboardEvent) => {
        const { key } = event;
        if (key === 'Meta' || key === 'Alt') {
            this.altKey_ = true;
        }

        if (key === 'Shift') {
            this.shiftKey_ = true;
        }
    };

    onMouseOut = (event: MouseEvent) => {
        const buttons = event.buttons;
        this.finish(buttons);
    };

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

    onKeyUp = (event: KeyboardEvent) => {
        const { key } = event;
        if (key === 'Meta' || key === 'Alt') {
            this.altKey_ = false;
        }

        if (key === 'Shift') {
            this.shiftKey_ = false;
        }
    };

    onContextMenu = (event: MouseEvent) => {
        //None yet
        event.preventDefault();
    };
}
