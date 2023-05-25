import { Shortcut } from '../shortcuts';
import { View } from '../view';

export class KeyMap {
    private keys: { [key: string]: boolean } = {};

    clone() {
        const clone = new KeyMap();
        clone.keys = { ...this.keys };
        return clone;
    }

    set(code: string, value: boolean) {
        console.log('setting', code, value);
        this.keys[code] = value;
    }

    get(code: string) {
        return this.keys[code];
    }

    get shift() {
        return this.keys['ShiftLeft'];
    }

    get alt() {
        return this.keys['AltLeft'] || this.keys['MetaLeft'];
    }

    get ctrl() {
        return this.keys['ControlLeft'];
    }

    get escape() {
        return this.keys['Escape'];
    }
}

interface IKeyboardEvent {
    view?: View;
    code: string;
}

export class KeyboardControls {
    readonly keyMap: KeyMap = new KeyMap();
    private shortcuts: Shortcut[] = [];
    active?: Shortcut;

    addShortcut(shortcut: Shortcut) {
        this.shortcuts.push(shortcut);
    }

    removeShortcut(shortcut: Shortcut) {
        const index = this.shortcuts.indexOf(shortcut);
        if (index >= 0) this.shortcuts.splice(index, 1);
        else console.warn('Shortcut not found', this.shortcuts, shortcut);
    }

    down(event: IKeyboardEvent) {
        const { code, view } = event;
        this.keyMap.set(code, true);
        this.callShortcuts(code, view);
    }

    up(event: IKeyboardEvent) {
        const { code } = event;
        this.keyMap.set(code, false);
    }

    private callShortcuts(code: string, view?: View) {
        this.handleCancels(code);
        if (!view) return;
        this.handleStart(view, code);
    }

    private handleStart(view: View, code: string) {
        for (const shortcut of this.shortcuts) {
            if (shortcut.code === code) {
                if (shortcut.onPress) shortcut.onPress(view);
                if (shortcut.onMove && !this.active) {
                    this.active = shortcut;
                    shortcut.onStart && shortcut.onStart(view);
                }
            }
        }
    }

    private handleCancels(code: string) {
        if (code === 'Escape') {
            if (this.active && this.active.onCancel) {
                this.active.onCancel();
                this.active = undefined;
            }
        }
    }
}
