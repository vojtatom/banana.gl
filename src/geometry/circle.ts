
export function circleTriangulated(radius: number, segments: number, z: number = 0) {
    const vertices = [];
    const angleStep = 2 * Math.PI / segments;
    for(let i = 0; i < segments; i++) {
        const angle = i * angleStep;
        vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), z);
        vertices.push(0, 0, z);
        vertices.push(radius * Math.cos(angle + angleStep), radius * Math.sin(angle + angleStep), z);
    }
    return new Float32Array(vertices);
}