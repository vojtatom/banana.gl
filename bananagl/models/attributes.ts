import { Shader } from '@bananagl/shaders/shader';

import { Attribute, ElementAttribute, InstancedAttribute } from './attribute';

export class Attributes {
    private vao?: WebGLVertexArrayObject;
    private attributes: (Attribute | InstancedAttribute)[] = [];
    private isIndexed_ = false;
    private isInstanced_ = false;
    private elements?: ElementAttribute;

    constructor() {}

    add(attribute: Attribute) {
        if (attribute instanceof InstancedAttribute) {
            this.isInstanced_ = true;
        }

        if (attribute instanceof ElementAttribute) {
            if (this.isIndexed_) throw new Error('Cannot have more than one index buffer');
            this.isIndexed_ = true;
            this.elements = attribute;
        }

        this.attributes.push(attribute);
    }

    private setup(gl: WebGL2RenderingContext, shader: Shader) {
        const vao = gl.createVertexArray();
        if (!vao) throw new Error('Failed to create vertex array object');
        gl.bindVertexArray(vao);

        for (const attribute of this.attributes) {
            const location = shader.attributes[attribute.name];
            attribute.bind(gl, location);
        }

        //gl.bindVertexArray(null);
        this.vao = vao;
    }

    get count() {
        if (!this.attributes.length) throw new Error('No attributes');

        if (this.elements) {
            return this.elements.count;
        } else {
            return this.attributes[0].count / this.attributes[0].size;
        }
    }

    get buffers() {
        return this.attributes.map((a) => a.buffer);
    }

    get isIndexed() {
        return this.isIndexed_;
    }

    get isInstanced() {
        return this.isInstanced_;
    }

    getAttribute(name: string) {
        return this.attributes.find((a) => a.name === name);
    }

    get rawAttributes() {
        return this.attributes;
    }

    get elementType() {
        if (!this.elements) throw new Error('No element buffer');
        if (this.elements.type === undefined) throw new Error('No element type');
        return this.elements.type;
    }

    bind(gl: WebGL2RenderingContext, shader: Shader) {
        if (!this.vao) this.setup(gl, shader);
        else gl.bindVertexArray(this.vao);
    }
}
