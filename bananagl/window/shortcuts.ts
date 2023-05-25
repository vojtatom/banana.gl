import { View } from './view';

export interface Shortcut {
    readonly code: string;
    onPress?(view: View): void;
    onStart?(view: View): void;
    onMove?(view: View, dx: number, dy: number): void;
    onCancel?(): void;
    set onTrigger(callback: CallableFunction);
}

export class ShortcutOnPress implements Shortcut {
    constructor(readonly code: string, private callback?: (view: View) => void) {}

    onPress(view: View) {
        if (!this.callback) return;
        this.callback(view);
    }

    set onTrigger(callback: (view: View) => void) {
        this.callback = callback;
    }
}

export class ShortcutOnMouseMove<StorageT> implements Shortcut {
    constructor(
        readonly code: string,
        private startCallback?: (view: View) => void,
        private moveCallback?: (view: View, dx: number, dy: number) => void,
        private cancelCallback?: (data?: StorageT) => void,
        public storage?: StorageT
    ) {}

    onStart(view: View) {
        if (!this.startCallback) return;
        this.startCallback(view);
    }

    onMove(view: View, dx: number, dy: number) {
        if (!this.moveCallback) return;
        this.moveCallback(view, dx, dy);
    }

    onCancel(): void {
        if (!this.cancelCallback) return;
        this.cancelCallback(this.storage);
    }

    set onTrigger(callback: (view: View, dx: number, dy: number) => void) {
        this.moveCallback = callback;
    }

    set onStartCall(callback: (view: View) => void) {
        this.startCallback = callback;
    }

    set onCancelCall(callback: (data?: StorageT) => void) {
        this.cancelCallback = callback;
    }
}
