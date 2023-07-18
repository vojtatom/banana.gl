export class ColorTexture {
    readonly texture: WebGLTexture;
    public size: [number, number];

    constructor(gl: WebGL2RenderingContext, width: number, height: number) {
        const texture = gl.createTexture();
        if (!texture) throw new Error('Failed to create texture');
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); //may shouldn't be null?
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.texture = texture;
        this.size = [width, height];
    }

    dispose(gl: WebGL2RenderingContext) {
        gl.deleteTexture(this.texture);
    }
}

export class DepthTexture {
    readonly texture: WebGLTexture;
    public size: [number, number];

    constructor(gl: WebGL2RenderingContext, width: number, height: number) {
        const texture = gl.createTexture();
        if (!texture) throw new Error('Failed to create texture');
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT32F,
            width,
            height,
            0,
            gl.DEPTH_COMPONENT,
            gl.FLOAT,
            null
        ); //may shouldn't be null?
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.texture = texture;
        this.size = [width, height];
    }

    dispose(gl: WebGL2RenderingContext) {
        gl.deleteTexture(this.texture);
    }
}
