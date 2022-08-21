import { MetadataTable } from '../../layer/layer';
import { sampleColor } from './color';
import { StyleRule, StyleRuleAlways, StyleRuleAttributeEqualTo, StyleRuleAttributeRange, StyleRuleAttributeRangeExt } from './rule';
import { deserializeRule, serializeRule } from './serialize';




export interface Style {
    forAll: () => Style;
    withAttributeEqualTo: (attribute: string, value: number) => Style;
    withAttributeRange: (attribute: string, min: number, max: number) => Style;
    withAttributeRangeExt: (attribute: string, min: number, max: number) => Style;
    useColor: (color: number | number[]) => Style;
    apply: (metadata: MetadataTable) => number | undefined;
    serialize: () => string;
    deserialize: (styleSerialized: string) => Style;
}


export function Style(): Style {
    let rules: StyleRule[] = [];
    let color: number | number[] =  0x00ffff;
    
    const style = {
        forAll,
        withAttributeEqualTo,
        withAttributeRange,
        withAttributeRangeExt,
        useColor,
        apply,
        serialize,
        deserialize
    };

    return style;

    function forAll() {
        rules.push(new StyleRuleAlways());
        return style;
    }

    function withAttributeEqualTo(attribute: string, value: number) {
        rules.push(new StyleRuleAttributeEqualTo({ attribute, value }));
        return style;
    }

    function withAttributeRange(attribute: string, min: number, max: number) {
        rules.push(new StyleRuleAttributeRange({ attribute, min, max }));
        return style;
    }

    function withAttributeRangeExt(attribute: string, min: number, max: number) {
        rules.push(new StyleRuleAttributeRangeExt({ attribute, min, max }));
        return style;
    }

    function useColor(color_: number | number[]) {
        color = color_;
        return style;
    }

    function apply(metadata: MetadataTable) {
        let applyColorIndicator = Math.random();
        for (const rule of rules) {
            applyColorIndicator = rule.apply(metadata);
            if (applyColorIndicator < 0 || applyColorIndicator > 1) {
                return;
            }
        }
        return sampleColor(color, applyColorIndicator);
    }

    function serialize() {
        const style_ = {
            rules: rules.map(serializeRule),
            color: color
        };
        return JSON.stringify(style_);
    }

    function deserialize(styleSerialized: string) {
        const style_ = JSON.parse(styleSerialized);
        rules = style_.rules.map(deserializeRule);
        color = style_.color;
        return style;
    }
}


