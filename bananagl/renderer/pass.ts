import { Renderable } from '@bananagl/models/renderable';
import { Scene } from '@bananagl/scene/scene';
import { Shader } from '@bananagl/shaders/shader';
import { Renderer } from './renderer';

export function viewRenderPass(scene: Scene, renderer: Renderer) {
    const gl = renderer.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    const renderables = scene.objects;
    //sort by shader class type
    renderables.sort((a, b) => {
        if (a.shader.constructor === b.shader.constructor) return 0;
        return a.shader.constructor < b.shader.constructor ? -1 : 1;
    });

    //render by shader class type
    let shader: Shader | null = null;
    for (const renderable of renderables) {
        if (shader === null || renderable.shader.constructor !== shader.constructor) {
            shader = renderable.shader;
            if (!shader.active) shader.setup(renderer.gl);
            shader.use();
        }

        render(renderer, renderable, shader);
    }
}

function render(renderer: Renderer, renderable: Renderable, shader: Shader) {
    const gl = renderer.gl;
    shader.uniforms = renderable.uniforms;
    renderable.attributes.bind(gl, shader);

    //TODO add support for indexed buffers
    //TODO add support for line primitives
    gl.drawArrays(gl.TRIANGLES, 0, renderable.attributes.count);
}
