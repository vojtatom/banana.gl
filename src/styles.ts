import { MetadataTable } from "./layer";
import { WorkerPool } from "./workerPool";


export class StylerWorkerPool extends WorkerPool  {
    private static _instance: StylerWorkerPool;
    static workerPath = "styler.js";
    
    private constructor()
    {
        super(StylerWorkerPool.workerPath, 5);
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    process(data: { style: Style, metadata: MetadataTable, ids: Float32Array }, callback: (...output: any[]) => void) 
    {
        const serialized = data.style.serialize();
        super.process({
            style: serialized,
            metadata: data.metadata,
            ids: data.ids
        }, callback);
    }
}

abstract class StyleRule {
    $type?: string;
    abstract apply(metadata: MetadataTable): number;
}

export class StyleRuleAlways extends StyleRule {
    $type = "always";
    apply(metadata: MetadataTable) {
        return Math.random();
    }
}

export class StyleRuleAttributeEqualTo extends StyleRule {
    attribute: string;
    value: any;
    $type = "attributeEqualTo";

    constructor(props: { attribute: string, value: any }) {
        super();
        this.attribute = props.attribute;
        this.value = props.value;
    }

    apply(metadata: MetadataTable) {
        if (metadata.hasOwnProperty(this.attribute) && metadata[this.attribute as any] == this.value) {
            return 1;
        }
        return -1;
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}


export class StyleRuleAttributeRange extends StyleRule {
    attribute: string;
    min: number;
    max: number;
    $type = "attributeRange";

    constructor(props: { attribute: string, min: number, max: number }) {
        super();
        this.attribute = props.attribute;
        this.min = props.min;
        this.max = props.max;
    }

    apply(metadata: MetadataTable) {
        if (metadata.hasOwnProperty(this.attribute)) {
            const value = metadata[this.attribute as any];
            return clamp((value - this.min) / (this.max - this.min), 0, 1);
        }
        return -1;
    }
}

export function serialize(rule: StyleRule) {
    return JSON.stringify(rule);
}

//ugly but safe
export function deserialize(rule: string) {
    const rule_ = JSON.parse(rule);
    switch (rule_.$type) {
        case "always":
            return new StyleRuleAlways();
        case "attributeEqualTo":
            return new StyleRuleAttributeEqualTo(rule_);
        case "attributeRange":
            return new StyleRuleAttributeRange(rule_);
        default:
            throw new Error("Unknown rule type: " + rule_.$type);
    }
}

export class Style {
    constructor(
        private rules: StyleRule[] = [],
        private defaultColor: number | number[] = 0xffffff,
        private color: number | number[] =  0x00ffff
    ) { }

    forAll() {
        this.rules.push(new StyleRuleAlways());
        return this;
    }

    withAttributeEqualTo(attribute: string, value: number) {
        this.rules.push(new StyleRuleAttributeEqualTo({ attribute, value }));
        return this;
    }

    withAttributeRange(attribute: string, min: number, max: number) {
        this.rules.push(new StyleRuleAttributeRange({ attribute, min, max }));
        return this;
    }

    useColor(color: number | number[]) {
        this.color = color;
        return this;
    }

    useDefault(color: number) {
        this.defaultColor = color;
        return this;
    }

    private lerpColor(a: number, b: number, fade: number) {
        const ar = a >> 16,
              ag = a >> 8 & 0xff,
              ab = a & 0xff,
    
              br = b >> 16,
              bg = b >> 8 & 0xff,
              bb = b & 0xff,
    
              rr = ar + fade * (br - ar),
              rg = ag + fade * (bg - ag),
              rb = ab + fade * (bb - ab);
    
        return (rr << 16) + (rg << 8) + (rb | 0);
    };

    private linearInterpolateColor(colorHexMap: number[], index: number) {
        if (colorHexMap.length == 1) {
            return colorHexMap[0];
        }

        const index0 = Math.floor(index * (colorHexMap.length - 1));
        const index1 = Math.min(index0 + 1, colorHexMap.length - 1);
        const fade = index - index0 / (colorHexMap.length - 1);

        return this.lerpColor(colorHexMap[index0], colorHexMap[index1], fade);

    }

    private sampleColor(color: number | number[], indicator: number) {
        if (Array.isArray(color)) {
            return this.linearInterpolateColor(color, indicator);
        }
        return color;
    }

    apply(metadata: MetadataTable) {
        let applyColorIndicator = Math.random();
        for (const rule of this.rules) {
            applyColorIndicator = rule.apply(metadata);
            if (applyColorIndicator < 0 || applyColorIndicator > 1) {
                return this.sampleColor(this.defaultColor, Math.random());
            }
        }
        return this.sampleColor(this.color, applyColorIndicator);
    }

    serialize() {
        const style_ = {
            rules: this.rules.map(serialize),
            defaultColor: this.defaultColor,
            color: this.color
        };
        return JSON.stringify(style_);
    }

    static deserialize(style: string) {
        const style_ = JSON.parse(style);
        return new Style(
            style_.rules.map(deserialize),
            style_.defaultColor,
            style_.color,
        );
    }
}