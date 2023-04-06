function handleSource(string: string, errorLine: number) {
    const lines = string.split('\n');
    const lines2 = [];

    const from = Math.max(errorLine - 6, 0);
    const to = Math.min(errorLine + 6, lines.length);

    for (let i = from; i < to; i++) {
        const line = i + 1;
        lines2.push(`${line === errorLine ? '>' : ' '} ${line}: ${lines[i]}`);
    }

    return lines2.join('\n');
}

function handleShaderErrors(gl: WebGL2RenderingContext, shader: WebGLShader, type: string) {
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    const errors = gl.getShaderInfoLog(shader)?.trim();

    if (status && (!errors || errors === '')) return '';
    if (!errors) return errors;

    const errorMatches = /ERROR: 0:(\d+)/.exec(errors);

    if (errorMatches) {
        const errorLine = parseInt(errorMatches[1]);
        const source = gl.getShaderSource(shader);
        if (!source) return errors;
        return type.toUpperCase() + '\n\n' + errors + '\n\n' + handleSource(source, errorLine);
    }
}

export function handleErrors(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    vs: WebGLShader,
    fs: WebGLShader
) {
    const programLog = gl.getProgramInfoLog(program)?.trim();
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
        const vertexErrors = handleShaderErrors(gl, vs, 'vertex');
        const fragmentErrors = handleShaderErrors(gl, fs, 'fragment');

        console.error(
            'WebGLProgram: Shader Error ' +
                gl.getError() +
                ' - ' +
                'VALIDATE_STATUS ' +
                gl.getProgramParameter(program, gl.VALIDATE_STATUS) +
                '\n\n' +
                'Program Info Log: ' +
                programLog +
                '\n' +
                vertexErrors +
                '\n' +
                fragmentErrors
        );
        return false;
    } else if (programLog !== '') {
        console.warn('WebGLProgram: Program Info Log:', programLog);
    }
    return true;
}
