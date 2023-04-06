import { Renderable } from '@3D/models/renderable';
import { Camera } from '@3D/scene/camera';
import { Scene } from '@3D/scene/scene';
import { Shader } from '@3D/shaders/shader';

import { Renderer } from './renderer';

export function viewRenderPass(scene: Scene, renderer: Renderer, camera: Camera) {
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
