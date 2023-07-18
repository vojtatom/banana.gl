import React from 'react';
import * as GL from '@bananagl/bananagl';

//
//Demo with postprocessing
//

const passVertex = `
in vec2 aPosition;

out vec2 vUv;

void main() {
    vUv = aPosition;
    gl_Position = vec4(aPosition * 2.0 - vec2(1.0), 0.0, 1.0);
}
`;

const passFragment = `
in vec2 vUv;

uniform sampler2D uColorTexture;
uniform sampler2D uDepthTexture;

out vec4 fragColor;

//For now this is fixed, but in the future we can extract it from camera
const float near = 1.0;
const float far = 1000.0;

void main() {
    //depth
    float depth = texture(uDepthTexture, vUv).x;
    float linearDepth = (2.0 * near) / (far + near - depth * (far - near));
    fragColor = vec4(vec3(linearDepth), 1.0);

    //color
    //fragColor = vec4(texture(uColorTexture, vUv).rgb, 1.0);
}
`;

export function DemoPostprocess() {
    const ref = React.useRef<HTMLCanvasElement>(null);
    const [renderer] = React.useState<GL.Renderer>(new GL.Renderer());
    const [scene] = React.useState<GL.Scene>(new GL.Scene());

    React.useEffect(() => {
        if (ref.current) {
            //Initialize renderer
            const canvas = ref.current;
            initCubes(canvas, renderer, scene);
            renderer.postprocess.enabled = true;

            //Add postprocess pass
            const pass = new GL.ScreenPass();
            pass.shader = new GL.Shader(passVertex, passFragment);
            renderer.postprocess.addPass(pass);
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
//------------------------------------------------------------------------
//gen geomtry
const vertex = `
in vec3 aPosition;
in vec3 aNormal;
in vec3 aOffset;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

out vec3 oColor;

const vec3 lightDirection = vec3(0.5, 0.5, 1.0);

void main() {
    vec3 normal = normalize(aNormal);
    float light = dot(normal, lightDirection);
    oColor = vec3(light, light, light);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition + aOffset, 1.0);
}
`;

const fragment = `
in vec3 oColor;

out vec4 fragColor;

void main() {
    fragColor = vec4(oColor, 1.0) * 0.1 + 0.9;
}
`;

function initCubes(canvas: HTMLCanvasElement, renderer: GL.Renderer, scene: GL.Scene) {
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
        -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
        0.5,

        // Back face
        -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5,
        -0.5, -0.5,

        // Top face
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
        -0.5,

        // Bottom face
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
        -0.5, -0.5,

        // Right face
        0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
        -0.5,

        // Left face
        -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
        -0.5, -0.5,
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

    let randomOffsets = [];
    for (let i = -20; i < 20; i++) {
        for (let j = -20; j < 20; j++) {
            randomOffsets.push(i);
            randomOffsets.push(j);
            randomOffsets.push(Math.random() * 1 - 0.5);
        }
    }
    const cubeOffsets = new Float32Array(randomOffsets);

    const model = new GL.Model();
    model.scale = [100, 100, 100];
    model.attributes.add(
        new GL.Attribute('aPosition', new GL.Buffer(cubeVertices), 3, false, 0, 0)
    );
    model.attributes.add(new GL.Attribute('aNormal', new GL.Buffer(cubeNormals), 3, false, 0, 0));
    model.attributes.add(
        new GL.InstancedAttribute('aOffset', new GL.Buffer(cubeOffsets), 3, 1, false, 0, 0)
    );
    model.shader = new GL.Shader(vertex, fragment);

    scene.add(model);
}
