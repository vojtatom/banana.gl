import { Selection } from '@bananagl/scene/selection';

export interface Selectable {
    onSelect(selection: Selection): void;
    onDeselect(selection: Selection): void;
}
