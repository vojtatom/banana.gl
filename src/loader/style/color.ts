

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
    const fade = index - index0 / (colorHexMap.length - 1);

    return lerpColor(colorHexMap[index0], colorHexMap[index1], fade);

}

export function sampleColor(color: number | number[], indicator: number) {
    if (Array.isArray(color)) {
        return linearInterpolateColor(color, indicator);
    }
    return color;
}
