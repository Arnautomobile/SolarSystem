class Material {
    constructor(gl, color = Color.black, alpha = 1, texture = null, normalMap = null, specularMap = null) {
        this.color = color;
        this.alpha = alpha;

        this.texture = setupTexture(gl, texture);
        this.hasTexture = this.texture !== null;

        this.normalMap = setupTexture(gl, normalMap);
        this.hasNormalMap = this.normalMap !== null;

        this.specularMap = setupTexture(gl, specularMap);
        this.hasSpecularMap = this.specularMap !== null;
    }

    
    // -----------------------------------------------------------------------------
    sendUniforms(gl, uniforms) {
        if (uniforms.alpha !== undefined) {
            gl.uniform1f(uniforms.alpha, this.alpha);
        }
        if (uniforms.color !== undefined) {
            gl.uniform3f(uniforms.color, this.color.r, this.color.g, this.color.b);
        }

        if (uniforms.texture !== undefined && this.hasTexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(uniforms.texture, 0);
        }

        if (uniforms.normalMap !== undefined) {
            if (this.hasNormalMap) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.normalMap);
                gl.uniform1i(uniforms.normalMap, 1);
                gl.uniform1i(uniforms.hasNormalMap, 1);
            }
            else {
                gl.uniform1i(uniforms.hasNormalMap, 0);
            }
        }

        if (uniforms.specularMap !== undefined) {
            if (this.hasSpecularMap) {
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.specularMap);
                gl.uniform1i(uniforms.specularMap, 2);
                gl.uniform1i(uniforms.hasSpecularMap, 1);
            }
            else {
                gl.uniform1i(uniforms.hasSpecularMap, 0);
            }
        }
    }
}


class Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    static black = new Color();
    static white = new Color(1,1,1);
    static red = new Color(1,0,0);
    static green = new Color(0,1,0);
    static blue = new Color(0,0,1);
}