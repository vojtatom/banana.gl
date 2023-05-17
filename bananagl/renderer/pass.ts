import { Camera } from '@bananagl/camera/camera';
import { Renderable } from '@bananagl/models/renderable';
import { Scene } from '@bananagl/scene/scene';
import { Shader } from '@bananagl/shaders/shader';

import { Renderer } from './renderer';

export function viewRenderPass(scene: Scene, renderer: Renderer, camera: Camera) {
    const gl = renderer.gl;
    scene.removeDisposed(gl);
    if (scene.dirtyShaderOrder) scene.sortByShader();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    const noDepth = scene.noDepthObjects;
    renderObjectGroup(noDepth, renderer, camera);

    gl.enable(gl.DEPTH_TEST);
    const opaque = scene.opaqueObjects;
    renderObjectGroup(opaque, renderer, camera);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    const transparent = scene.transparentObjects;
    renderObjectGroup(transparent, renderer, camera);
}

function renderObjectGroup(objects: Renderable[], renderer: Renderer, camera: Camera) {
    let shader: Shader | null = null;
    for (const renderable of objects) {
        if (!renderable.visible) continue;
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

    if (renderable.attributes.isIndexed) {
        if (renderable.attributes.isInstanced) {
            console.warn('Instanced indexed rendering not supported');
        } else {
            gl.drawElements(
                renderable.mode,
                renderable.attributes.count,
                renderable.attributes.elementType,
                0
            );
        }
    } else {
        if (renderable.attributes.isInstanced) {
            gl.drawArraysInstanced(
                renderable.mode,
                0,
                renderable.attributes.count,
                renderable.attributes.instanceCount
            );
        } else {
            gl.drawArrays(renderable.mode, 0, renderable.attributes.count);
        }
    }
}
