function getWebGLContext(canvasID) {
    let canvas = document.getElementById(canvasID);

    try {
        var gl = canvas.getContext("webgl", { alpha: false });
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;
        return gl;
    }
    catch (e) {
        console.error('Failed to initialize WebGL:', e);
    }

    if (!gl) {
        alert("Could not initialize WebGL.");
    }
    return null;
}


function createCompiledShader(gl, shaderText, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error('Shader compilation failed:', error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}


function createShaderProgram(gl, vertexShaderText, fragmentShaderText) {
    const vertexShader = createCompiledShader(gl, vertexShaderText, gl.VERTEX_SHADER);
    const fragmentShader = createCompiledShader(gl, fragmentShaderText, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
        console.error('Failed to compile shaders.')
        return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(shaderProgram);
        console.error('Program linking failed:', error);
        gl.deleteProgram(shaderProgram);
        return null;
    }
    return shaderProgram;
}


function setupTexture(gl, image) {
    if (image == null)
        return null;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}