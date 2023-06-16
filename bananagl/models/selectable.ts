export interface Selectable {
    select(submodelIDs: Set<number>): void;
    deselect(submodelIDs: Set<number>): void;
}
