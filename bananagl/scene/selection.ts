import { Renderable } from '@bananagl/bananagl';
import { Selectable } from '@bananagl/models/selectable';

export class Selection {
    constructor(readonly identifier: number, readonly object: Selectable) {}
}

export class SelectionManager {
    selected: Selection[] = [];
    constructor() {}

    select(identifier: number, object: Selectable) {
        const selection = new Selection(identifier, object);
        this.selected.push(selection);
        object.onSelect(selection);
    }

    deselect(identifier: number, index?: number) {
        if (index === undefined)
            index = this.selected.findIndex((selection) => selection.identifier === identifier);
        if (index === -1) return;

        const selection = this.selected[index];
        this.selected.splice(index, 1);
        selection.object.onDeselect(selection);
    }

    toggleSelection(identifier: number, object: Selectable) {
        const index = this.selected.findIndex((selection) => selection.identifier === identifier);
        if (index === -1) {
            this.select(identifier, object);
        } else {
            this.deselect(identifier, index);
        }
    }

    clearSelection() {
        this.selected.forEach((selection) => selection.object.onDeselect(selection));
        this.selected = [];
    }
}
