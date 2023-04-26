import { Camera } from '@bananagl/camera/camera';
import { Renderable } from '@bananagl/models/renderable';
import { Scene } from '@bananagl/scene/scene';
import { Shader } from '@bananagl/shaders/shader';

import { Renderer } from './renderer';

export function viewRenderPass(scene: Scene, renderer: Renderer, camera: Camera) {
    const gl = renderer.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    if (scene.dirtyShaderOrder) scene.sortByShader();
    const opaque = scene.opaqueObjects;
    renderObjectGroup(opaque, renderer, camera);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    const transparent = scene.transparentObjects;
    renderObjectGroup(transparent, renderer, camera);
}

function renderObjectGroup(opaque: Renderable[], renderer: Renderer, camera: Camera) {
    //render by shader class type
    let shader: Shader | null = null;
    for (const renderable of opaque) {
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

    renderable.attributes.update(gl);
    renderable.attributes.bind(gl, shader);

    //todo instanced
    if (renderable.attributes.isIndexed) {
        if (renderable.attributes.isInstanced) {
            console.warn('instanced indexed rendering not supported');
        } else {
            gl.drawElements(
                gl.TRIANGLES,
                renderable.attributes.count,
                renderable.attributes.elementType,
                0
            );
        }
    } else {
        if (renderable.attributes.isInstanced) {
            gl.drawArraysInstanced(
                gl.TRIANGLES,
                0,
                renderable.attributes.count,
                renderable.attributes.instanceCount
            );
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, renderable.attributes.count);
        }
    }
}
