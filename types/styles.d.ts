import { MetadataTable } from "./layer";
import { WorkerPool } from "./workerPool";
export declare class StylerWorkerPool extends WorkerPool {
    private static _instance;
    static workerPath: string;
    private constructor();
    static get Instance(): StylerWorkerPool;
    process(data: {
        style: Style;
        metadata: MetadataTable;
        ids: Float32Array;
    }, callback: (...output: any[]) => void): void;
}
declare abstract class StyleRule {
    $type?: string;
    abstract apply(metadata: MetadataTable): number;
}
export declare class StyleRuleAlways extends StyleRule {
    $type: string;
    apply(metadata: MetadataTable): number;
}
export declare class StyleRuleAttributeEqualTo extends StyleRule {
    attribute: string;
    value: any;
    $type: string;
    constructor(props: {
        attribute: string;
        value: any;
    });
    apply(metadata: MetadataTable): 1 | -1;
}
export declare class StyleRuleAttributeRange extends StyleRule {
    attribute: string;
    min: number;
    max: number;
    $type: string;
    constructor(props: {
        attribute: string;
        min: number;
        max: number;
    });
    apply(metadata: MetadataTable): number;
}
export declare function serialize(rule: StyleRule): string;
export declare function deserialize(rule: string): StyleRuleAlways | StyleRuleAttributeEqualTo | StyleRuleAttributeRange;
export declare class Style {
    private rules;
    private defaultColor;
    private color;
    constructor(rules?: StyleRule[], defaultColor?: number | number[], color?: number | number[]);
    forAll(): this;
    withAttributeEqualTo(attribute: string, value: number): this;
    withAttributeRange(attribute: string, min: number, max: number): this;
    useColor(color: number | number[]): this;
    useDefault(color: number): this;
    private lerpColor;
    private linearInterpolateColor;
    private sampleColor;
    apply(metadata: MetadataTable): number;
    serialize(): string;
    static deserialize(style: string): Style;
}
export {};
