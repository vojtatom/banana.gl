import { LineSegments2 } from 'three-fatline';
import { Graphics } from "./graphics";
import { MaterialLibrary } from "./material";
export declare type ObjectSelectionProps = {
    graphics: Graphics;
    bbox: [number[], number[]];
    material: MaterialLibrary;
};
export declare class ObjectSelection {
    graphics: Graphics;
    mesh: LineSegments2;
    constructor(props: ObjectSelectionProps);
    remove(): void;
}
