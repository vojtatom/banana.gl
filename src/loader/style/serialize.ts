import { StyleRule, StyleRuleAlways, StyleRuleAttributeEqualTo, StyleRuleAttributeRange } from './rule';


export function serializeRule(rule: StyleRule) {
    return JSON.stringify(rule);
}

export function deserializeRule(rule: string) {
    const rule_ = JSON.parse(rule);
    //ugly but safe
    switch (rule_.$type) {
    case 'always':
        return new StyleRuleAlways();
    case 'attributeEqualTo':
        return new StyleRuleAttributeEqualTo(rule_);
    case 'attributeRange':
        return new StyleRuleAttributeRange(rule_);
    default:
        throw new Error('Unknown rule type: ' + rule_.$type);
    }
}
