export interface Selectable {
    select(submodelIDs: number[]): void;
    deselect(submodelIDs: number[]): void;
}
