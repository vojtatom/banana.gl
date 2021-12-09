


export function getNthTriangularNumber(n: number) {
    return (n * (n + 1)) / 2;
}


export function toSpiral(x: number, y: number) {
    let level = Math.max(Math.abs(x), Math.abs(y))

    if (x === 0 && y === 0) {
        return 0
    }

    let base = getNthTriangularNumber(level - 1) * 8;

    if ((x > Math.abs(y)) || (x === y && x > 0)) {
        return base + level + y;
    } else if (((y > Math.abs(x)) || (y === -x)) && (y > 0)) {
        return base + (level * 4) - (level) - x;
    } else if ((x < y) || ((x === y) && (x < 0))) {
        return base + (level * 5) - y;
    } else if ((y < x) || ((-y === x) && (y < 0))) {
        return base + (level * 7) + x;
    }
    throw new Error("Cannot covert to 1D");
}
