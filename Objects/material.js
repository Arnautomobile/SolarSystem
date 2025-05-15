class Material {
    constructor(gl, color = Color.black, alpha = 1, texture1 = null, texture2 = null, texture3 = null) {
        this.color = color;
        this.alpha = alpha;

        this.texture1 = setupTexture(gl, texture1);
        // base map
        this.hasTex1 = this.texture1 !== null;

        this.texture2 = setupTexture(gl, texture2);
        // can be specular or flow map
        this.hasTex2 = this.texture2 !== null;

        this.texture3 = setupTexture(gl, texture3);
        // normal map or night texture in earth shader
        this.hasTex3 = this.texture3 !== null;
    }

    
    // -----------------------------------------------------------------------------
    sendUniforms(gl, uniforms) {
        if (uniforms.alpha !== undefined) {
            gl.uniform1f(uniforms.alpha, this.alpha);
        }
        if (uniforms.color !== undefined) {
            gl.uniform3f(uniforms.color, this.color.r, this.color.g, this.color.b);
        }

        if (uniforms.texture !== undefined && this.hasTex1) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture1);
            gl.uniform1i(uniforms.texture, 0);
        }

        if (uniforms.normalMap !== undefined) {
            if (this.hasTex2) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.texture2);
                gl.uniform1i(uniforms.normalMap, 1);
                gl.uniform1i(uniforms.hasNormalMap, 1);
            }
            else {
                gl.uniform1i(uniforms.hasNormalMap, 0);
            }
        }

        if (uniforms.specularMap !== undefined && this.hasTex2) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texture2);
            gl.uniform1i(uniforms.specularMap, 1);
        }

        if (uniforms.flowMap !== undefined) {
            if (this.hasTex3) {
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.texture3);
                gl.uniform1i(uniforms.flowMap, 2);
                gl.uniform1i(uniforms.hasFlowMap, 1);
            }
            else {
                gl.uniform1i(uniforms.hasFlowMap, 0);
            }
        }

        if (uniforms.textureNight !== undefined && this.hasTex3) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.texture3);
            gl.uniform1i(uniforms.textureNight, 2);
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