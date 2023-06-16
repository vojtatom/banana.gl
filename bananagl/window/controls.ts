import { View } from '@bananagl/window/view';
import { Window } from '@bananagl/window/window';

import { KeyboardControls } from './controls/keyboard';
import { MouseControls } from './controls/mouse';
import { Shortcut } from './shortcuts';

type LocalViewCoords = { view: View; x: number; y: number; lx: number; ly: number };

export class WindowControls {
    public view?: View;
    readonly mouse = new MouseControls();
    readonly keyboard = new KeyboardControls();
    private deactSh: boolean = false;

    constructor(private window: Window) {}

    pointerDown(event: PointerEvent) {
        const localView = this.window.getViewAndPosition(event);
        if (!localView) return;
        this.view = localView.view;
        this.mouse.down(this.getEvent(localView, event));
        //deactivate any active keyboard shortcut
        if (this.keyboard.active) (this.deactSh = true), (this.keyboard.active = undefined);
        event.preventDefault();
    }

    pointerMove(event: PointerEvent) {
        const localView = this.window.getViewAndPosition(event);
        if (!localView) return;
        if (!this.view) return;
        this.mouse.move(this.getEvent(localView, event));
        event.preventDefault();
    }

    pointerUp(event: PointerEvent) {
        const localView = this.window.getViewAndPosition(event);
        if (!localView) return;
        if (!this.view) return;
        event.preventDefault();

        this.deactSh = false;
        return this.mouse.up(this.getEvent(localView, event), this.deactSh);
    }

    pointerOut(event: MouseEvent) {
        this.mouse.out();
        event.preventDefault();
    }

    wheel(event: WheelEvent) {
        const localView = this.window.getViewAndPosition(event);
        if (!localView) return;
        this.view = localView.view;
        this.mouse.wheel({
            view: this.view,
            delta: event.deltaY,
            x: localView.x,
            y: localView.y,
        });
    }

    contextMenu(event: MouseEvent) {
        event.preventDefault();
    }

    keydown(event: KeyboardEvent) {
        this.keyboard.down({
            view: this.view,
            code: event.code,
        });
    }

    keyup(event: KeyboardEvent) {
        this.keyboard.up({
            view: this.view,
            code: event.code,
        });
    }

    addShortcut(shortcut: Shortcut) {
        this.keyboard.addShortcut(shortcut);
    }

    removeShortcut(shortcut: Shortcut) {
        this.keyboard.removeShortcut(shortcut);
    }

    private getEvent(localView: LocalViewCoords, event: PointerEvent) {
        if (!this.view)
            throw new Error('No view, check before calling getEvent() in WindowControls');
        return {
            view: this.view,
            x: localView.x,
            y: localView.y,
            button: event.button,
            keyMap: this.keyboard.keyMap,
            moveShortcut: this.keyboard.active,
        };
    }
}
