import { Attribute, Buffer, Model } from '@bananagl/bananagl';

export class ScreenPass extends Model {
    constructor() {
        super();
        const vertices = new Float32Array(
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 0],
                [1, 1],
                [0, 1],
            ].flat()
        );
        this.attributes.add(new Attribute('aPosition', new Buffer(vertices), 2));
    }

    bindTextures(color: WebGLTexture, depth: WebGLTexture) {
        this.uniforms = {
            uColorTexture: color,
            uDepthTexture: depth,
        };
    }
}
