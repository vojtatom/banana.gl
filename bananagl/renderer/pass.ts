import { Camera } from '@bananagl/controls/camera';
import { Renderable } from '@bananagl/models/renderable';
import { Scene } from '@bananagl/scene/scene';
import { Shader } from '@bananagl/shaders/shader';

import { Renderer } from './renderer';

export function viewRenderPass(scene: Scene, renderer: Renderer, camera: Camera) {
    const gl = renderer.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    if (scene.dirtyShaderOrder) scene.sortByShader();
    const renderables = scene.objects;

    //render by shader class type
    let shader: Shader | null = null;
    for (const renderable of renderables) {
        if (shader === null || renderable.shader !== shader) {
            shader = renderable.shader;
            if (!shader.active) shader.setup(renderer.gl);
            shader.use();
        }
        render(renderer, renderable, shader, camera);
    }
}

function render(renderer: Renderer, renderable: Renderable, shader: Shader, camera: Camera) {
    const gl = renderer.gl;
    shader.uniforms = camera.uniforms;
    shader.uniforms = renderable.uniforms;
    renderable.attributes.bind(gl, shader);

    //todo instanced
    if (renderable.attributes.isIndexed) {
        gl.drawElements(
            gl.TRIANGLES,
            renderable.attributes.count,
            renderable.attributes.elementType,
            0
        );
    } else gl.drawArrays(gl.TRIANGLES, 0, renderable.attributes.count);
}
