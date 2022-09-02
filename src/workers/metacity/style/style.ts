import { MetadataTable } from '../../../layer/layer';
import { sampleColor } from './color';
import { StyleRule, StyleRuleAlways, StyleRuleAttributeEqualTo, StyleRuleAttributeRange, StyleRuleAttributeRangeExt } from './rule';
import { deserializeRule, serializeRule } from './serialize';


export class Style {
    rules: StyleRule[] = [];
    color: number | number[] =  0x00ffff;

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

    withAttributeRangeExt(attribute: string, min: number, max: number) {
        this.rules.push(new StyleRuleAttributeRangeExt({ attribute, min, max }));
        return this;
    }

    useColor(color_: number | number[]) {
        this.color = color_;
        return this;
    }

    apply(metadata: MetadataTable) {
        let applyColorIndicator = Math.random();
        for (const rule of this.rules) {
            applyColorIndicator = rule.apply(metadata);
            if (applyColorIndicator < 0 || applyColorIndicator > 1) {
                return;
            }
        }
        return sampleColor(this.color, applyColorIndicator);
    }

    serialize() {
        const style_ = {
            rules: this.rules.map(serializeRule),
            color: this.color
        };
        return JSON.stringify(style_);
    }

    static deserialize(styleSerialized: string) {
        const style = new Style();
        const style_ = JSON.parse(styleSerialized);
        style.rules = style_.rules.map(deserializeRule);
        style.color = style_.color;
        return style;
    }
}


