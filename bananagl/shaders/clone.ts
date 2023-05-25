import { UniformValue } from './shader';

function isArray(a: any): a is any[] {
    return Array.isArray(a);
}

export function cloneValue(value: UniformValue) {
    //TODO optimize this to prevent reallocation
    if (isArray(value)) return value.slice();
    if (value instanceof Float32Array) return new Float32Array(value);
    if (value instanceof Int32Array) return new Int32Array(value);
    if (value instanceof Int16Array) return new Int16Array(value);
    if (value instanceof Int8Array) return new Int8Array(value);
    if (value instanceof Uint32Array) return new Uint32Array(value);
    if (value instanceof Uint16Array) return new Uint16Array(value);
    if (value instanceof Uint8Array) return new Uint8Array(value);
    return value;
}

export function cloneUniforms(uniforms: { [name: string]: UniformValue }) {
    const clone: { [name: string]: UniformValue } = {};
    for (const name in uniforms) {
        const value = uniforms[name];
        clone[name] = cloneValue(value);
    }
    return clone;
}
