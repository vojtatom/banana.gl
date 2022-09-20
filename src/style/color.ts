function lerpColor(a: number, b: number, fade: number) {
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
}

export function linearInterpolateColor(colorHexMap: number[], index: number) {
    if (colorHexMap.length == 1) {
        return colorHexMap[0];
    }
    const index0 = Math.floor(index * (colorHexMap.length - 1));
    const index1 = Math.min(index0 + 1, colorHexMap.length - 1);
    const F = 1 / (colorHexMap.length - 1);
    const fade = (index - index0 * F) / F;
    return lerpColor(colorHexMap[index0], colorHexMap[index1], fade);

}

export function sampleColor(color: number | number[], indicator: number) {
    if (Array.isArray(color)) {
        return linearInterpolateColor(color, indicator);
    }
    return color;
}

export function colorHex(hex: number) {
    const r = ( hex >> 16 & 255 ) / 255;
    const g = ( hex >> 8 & 255 ) / 255;
    const b = ( hex & 255 ) / 255;
    return [r, g, b];
}

export function colorStrToHex(color: string) {
    return parseInt(color.replace('#', ''), 16);
}

export function colorStrToArr(str: string): number[] {
    const hex = colorStrToHex(str);
    return colorHex(hex);
}