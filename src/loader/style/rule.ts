import { MetadataRecord } from '../../layer/layer';

export abstract class StyleRule {
    $type?: string;
    abstract apply(metadata: MetadataRecord): number;
}

export class StyleRuleAlways extends StyleRule {
    $type = 'always';
    apply() {
        return Math.random();
    }
}

export class StyleRuleAttributeEqualTo extends StyleRule {
    attribute: string;
    value: number | string;
    $type = 'attributeEqualTo';

    constructor(props: { attribute: string, value: number | string }) {
        super();
        this.attribute = props.attribute;
        this.value = props.value;
    }

    apply(metadata: MetadataRecord) {
        if (Object.prototype.hasOwnProperty.call(metadata, this.attribute) && metadata[this.attribute] == this.value) {
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
    $type = 'attributeRange';

    constructor(props: { attribute: string, min: number, max: number }) {
        super();
        this.attribute = props.attribute;
        this.min = props.min;
        this.max = props.max;
    }

    apply(metadata: MetadataRecord) {
        if (Object.prototype.hasOwnProperty.call(metadata, this.attribute)) {
            const value = metadata[this.attribute];
            return (value - this.min) / (this.max - this.min)
        }
        return -1;
    }
}

export class StyleRuleAttributeRangeExt extends StyleRuleAttributeRange {
    $type = 'attributeRangeExt';

    constructor(props: { attribute: string, min: number, max: number }) {
        super(props);
    }

    apply(metadata: MetadataRecord) {
        if (Object.prototype.hasOwnProperty.call(metadata, this.attribute)) {
            const value = metadata[this.attribute];
            return clamp((value - this.min) / (this.max - this.min), 0, 1);
        }
        return -1;
    }
}