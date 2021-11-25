

function capLeft(resolution: number) {
    let vertices = [];
    const shift = Math.PI / 2;
    const step = Math.PI / resolution;

    for (let i = 0; i < resolution; ++i) {
        vertices.push(0, 0, 0);
        vertices.push(Math.cos(shift + step * i), Math.sin(shift + step * i), 0);
        vertices.push(Math.cos(shift + step * (i + 1)), Math.sin(shift + step * (i + 1)), 0);

    }

    return vertices
}

function capRight(resolution: number) {
    let vertices = [];
    const shift = Math.PI / 2;
    const step = Math.PI / resolution;

    for (let i = 0; i < resolution; ++i) {
        vertices.push(1, 0, 0);
        vertices.push(1 - Math.cos(shift + step * i), Math.sin(shift + step * i), 0);
        vertices.push(1 - Math.cos(shift + step * (i + 1)), Math.sin(shift + step * (i + 1)), 0);
    }

    return vertices;
}

export function segment(resolution: number = 5) {
    let geometry = [
        0, -1, 0,
        1, -1, 0,
        1, 1, 0,
        0, -1, 0,
        1, 1, 0,
        0, 1, 0
    ];

    geometry = geometry.concat(capLeft(resolution));
    geometry = geometry.concat(capRight(resolution));
    return geometry;
}
