import React from 'react';
import renderer from 'react-test-renderer';
import { Renderer, Shader } from '@bananagl/bananagl';

const vs = `
in vec2 a_position;

uniform mat4 u_projection;

void main() {
    gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
}
`;

const fs = `
out vec4 outColor;

void main() {
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

export function ShaderTest() {
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const [renderer] = React.useState<Renderer>(new Renderer());

    React.useEffect(() => {
        if (!canvas.current) return;
        renderer.init(canvas.current);
        const shader = new Shader(vs, fs);
        shader.setup(renderer.gl);
        console.log(shader);
    }, []);

    return <canvas ref={canvas} />;
}
