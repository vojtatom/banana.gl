import React from 'react';
import * as GL from '@bananagl/bananagl';

//
//Demo with basic controls and models
//

const vertex = `
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

out vec3 oColor;

const vec3 lightDirection = vec3(0.5, 0.5, 1.0);

void main() {
    vec3 normal = normalize(aNormal);
    float light = dot(normal, lightDirection);
    oColor = vec3(light, light, light);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
`;

const fragment = `
in vec3 oColor;

out vec4 fragColor;

void main() {
    fragColor = vec4(oColor, 1.0) * 0.1 + 0.9;
}
`;

export function DemoModels() {
    const ref = React.useRef<HTMLCanvasElement>(null);
    const [renderer] = React.useState<GL.Renderer>(new GL.Renderer());
    const [scene] = React.useState<GL.Scene>(new GL.Scene());

    React.useEffect(() => {
        if (ref.current) {
            //Initialize renderer
            const canvas = ref.current;
            GL.mountRenderer(canvas, renderer, {}, [
                {
                    view: new GL.View(scene),
                    size: { width: 100, height: 100, mode: 'relative' },
                    position: { top: 0, left: 0, mode: 'relative' },
                },
            ]);
            renderer.clearColor = [0.5, 0.5, 0.5, 1];

            //Add basic cube model
            const cubeVertices = new Float32Array([
                // Front face
                -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
                -0.5, 0.5,

                // Back face
                -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
                -0.5, -0.5, -0.5,

                // Top face
                -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5,
                0.5, -0.5,

                // Bottom face
                -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
                -0.5, -0.5, -0.5,

                // Right face
                0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
                -0.5, -0.5,

                // Left face
                -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
                -0.5, -0.5, -0.5,
            ]);

            const cubeNormals = new Float32Array([
                // Front face
                0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

                // Back face
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

                // Top face
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

                // Bottom face
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

                // Right face
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

                // Left face
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
            ]);

            const model = new GL.Model();
            model.scale = [100, 100, 100];
            model.attributes.add(
                new GL.Attribute('aPosition', new GL.Buffer(cubeVertices), 3, false, 0, 0)
            );
            model.attributes.add(
                new GL.Attribute('aNormal', new GL.Buffer(cubeNormals), 3, false, 0, 0)
            );
            model.shader = new GL.Shader(vertex, fragment);

            scene.add(model);
        }

        const keydown = (e: KeyboardEvent) => {
            renderer.controls?.keydown(e);
        };

        const keyup = (e: KeyboardEvent) => {
            renderer.controls?.keyup(e);
        };

        document.addEventListener('keydown', keydown);
        document.addEventListener('keyup', keyup);

        return () => {
            GL.unmountRenderer(renderer);
            document.removeEventListener('keydown', keydown);
            document.removeEventListener('keyup', keyup);
        };
    }, []);

    const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
    };

    //to prevent scrolling of the entire page
    React.useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        canvas.addEventListener('wheel', handleWheel);
        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [ref]);

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
            }}
        >
            <canvas
                id="canvas"
                key="canvas"
                ref={ref}
                tabIndex={10000}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                onPointerDown={(e) => {
                    renderer.controls?.pointerDown(e.nativeEvent);
                }}
                onPointerMove={(e) => {
                    renderer.controls?.pointerMove(e.nativeEvent);
                }}
                onPointerUp={(e) => {
                    let selection = renderer.controls?.pointerUp(e.nativeEvent);
                    // console.log(selection);
                }}
                onWheel={(e) => {
                    renderer.controls?.wheel(e.nativeEvent);
                }}
                onPointerOut={(e) => {
                    renderer.controls?.pointerOut(e.nativeEvent);
                }}
                onContextMenu={(e) => {
                    renderer.controls?.contextMenu(e.nativeEvent);
                }}
            />
        </div>
    );
}
