import { Pickable } from '@bananagl/bananagl';
import { View } from '@bananagl/window/view';
import { Window } from '@bananagl/window/window';

import { Shortcut } from './shortcuts';

export class WindowControls {
    private activeView_: View | null = null;
    private lastX_: number = 0;
    private lastY_: number = 0;
    private altKey_: boolean = false;
    private shiftKey_: boolean = false;
    private mouseDown_: boolean = false;
    private middleMouse_: boolean = false;
    private rightMouse_: boolean = false;
    private dpr_: number = window.devicePixelRatio;
    private downTime_: number = 0;
    private shortcuts_: Shortcut[] = [];
    private activeShortcut_: Shortcut | null = null;
    private onPick_: (object: Pickable) => void = () => {};

    constructor(private canvas: HTMLCanvasElement, private window: Window) {
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mousemove', this.onMouseMove);
        canvas.addEventListener('mouseup', this.onMouseUp);
        canvas.addEventListener('wheel', this.onMouseWheel);
        canvas.addEventListener('mouseout', this.onMouseOut);
        canvas.addEventListener('contextmenu', this.onContextMenu);
        canvas.addEventListener('keydown', this.onKeyDown);
        canvas.addEventListener('keyup', this.onKeyUp);
    }

    dispose() {
        const canvas = this.canvas;
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('mousemove', this.onMouseMove);
        canvas.removeEventListener('mouseup', this.onMouseUp);
        canvas.removeEventListener('wheel', this.onMouseWheel);
        canvas.removeEventListener('mouseout', this.onMouseOut);
        canvas.removeEventListener('contextmenu', this.onContextMenu);
        canvas.removeEventListener('keydown', this.onKeyDown);
        canvas.removeEventListener('keyup', this.onKeyUp);
    }

    addShortcut(shortcut: Shortcut) {
        this.shortcuts_.push(shortcut);
    }

    removeShortcut(shortcut: Shortcut) {
        const index = this.shortcuts_.indexOf(shortcut);
        if (index >= 0) {
            //console.log('Shortcut removed', index, this.shortcuts_, shortcut);
            this.shortcuts_.splice(index, 1);
        } else {
            console.warn('Shortcut not found', this.shortcuts_, shortcut);
        }
    }

    set onPick(onPick: (object: Pickable) => void) {
        this.onPick_ = onPick;
    }

    onMouseDown = (event: MouseEvent) => {
        const localView = this.window.getViewAndPosition(event);
        if (!localView) return;
        const { view, x, y } = localView;
        this.activeView_ = view;
        this.lastX_ = x;
        this.lastY_ = y;
        this.mouseDown_ = true;

        if (event.button === 1) {
            this.middleMouse_ = true;
        }

        if (event.button === 2) {
            this.rightMouse_ = true;
        }

        this.downTime_ = Date.now();
        //event.preventDefault();
    };

    onMouseMove = (event: MouseEvent) => {
        if (!this.activeView_) return;
        const { offsetX, offsetY } = event;
        const dx = (offsetX - this.lastX_) * this.dpr_;
        const dy = (offsetY - this.lastY_) * this.dpr_;
        this.lastX_ = offsetX;
        this.lastY_ = offsetY;

        if (this.activeShortcut_ && this.activeShortcut_.onMove) {
            this.activeShortcut_.onMove(this.activeView_, dx, dy);
        } else if (this.mouseDown_) {
            if (this.altKey_ || this.middleMouse_ || this.rightMouse_) {
                this.activeView_.cameraLock.restrictRotate(dx, dy);
                const { coords } = this.activeView_.cameraLock;
                this.activeView_.camera.rotate(coords[0], coords[1]);
            } else {
                this.activeView_.camera.pan(dx, dy);
            }
        }
    };

    onMouseUp = (event: MouseEvent) => {
        if (this.activeShortcut_) {
            this.activeShortcut_ = null;
        } else {
            if (Date.now() - this.downTime_ < 200) this.trace(event);
        }

        this.finish(event.button);
    };

    private trace(event: MouseEvent) {
        if (!this.activeView_) return;
        const { offsetX, offsetY } = event;
        const ndc = this.activeView_.toNDC(offsetX, offsetY);
        const ray = this.activeView_.camera.primaryRay(ndc[0], ndc[1]);
        const hit = this.activeView_.scene.picker.trace(ray);
        if (hit && hit.object.onPick) {
            hit.object.onPick(hit.object, hit.primitiveIndex, ray, hit.t, this.shiftKey_);
            if (this.onPick_) this.onPick_(hit.object);
        }
    }

    onMouseWheel = (event: WheelEvent) => {
        const local = this.window.getViewAndPosition(event);
        if (!local) return;
        const { view, lx, ly } = local;
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
        view.camera.zoom(factor, lx, ly);
        event.preventDefault();
    };

    onKeyDown = (event: KeyboardEvent) => {
        const { code } = event;
        console.log(`Pressed key ${code}`);

        if (code === 'MetaLeft' || code === 'AltLeft') {
            this.altKey_ = true;
        }

        if (code === 'ShiftLeft') {
            this.shiftKey_ = true;
        }

        if (code === 'Escape') {
            if (this.activeShortcut_ && this.activeShortcut_.onCancel) {
                this.activeShortcut_.onCancel();
                this.activeShortcut_ = null;
            }
        }

        this.callShortcuts(code);
    };

    onMouseOut = (event: MouseEvent) => {
        const buttons = event.buttons;
        this.finish(buttons);
    };

    private finish(button: number) {
        if (!this.mouseDown_) return;

        if (button === 1 || button === -1) {
            this.middleMouse_ = false;
        }

        if (button === 2 || button === -1) {
            this.rightMouse_ = false;
        }

        this.mouseDown_ = false;
    }

    onKeyUp = (event: KeyboardEvent) => {
        const { code } = event;
        if (code === 'MetaLeft' || code === 'AltLeft') {
            this.altKey_ = false;
        }

        if (code === 'ShiftLeft') {
            this.shiftKey_ = false;
        }
    };

    onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
    };

    private callShortcuts(code: string) {
        for (const shortcut of this.shortcuts_) {
            if (shortcut.code === code) {
                if (shortcut.onPress && this.activeView_) shortcut.onPress(this.activeView_);
                if (shortcut.onMove && this.activeView_ && !this.activeShortcut_) {
                    this.activeShortcut_ = shortcut;
                    shortcut.onStart && shortcut.onStart(this.activeView_);
                }
            }
        }
    }
}
