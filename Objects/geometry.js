class Geometry {
    constructor(gl, translation, rotation, scale) {
        this.gl = gl;
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    // -----------------------------------------------------------------------------
    getWorldMatrix() {
        return new Matrix4().multiply(this.translation).multiply(this.rotation).multiply(this.scale);
    }

    getPosition() {
        const e = this.getWorldMatrix().elements;
        return new Vector4(e[3], e[7], e[11], 1);
    }

    getScale() {
        return this.scale.elements[0];
    }


    // -----------------------------------------------------------------------------
    create(jsonFileData) {
        // Fish out references to relevant data pieces from 'data'
        const verts = jsonFileData.meshes[0].vertices;
        const normals = jsonFileData.meshes[0].normals;
        const tangents = jsonFileData.meshes[0].tangents;
        const bitangents = jsonFileData.meshes[0].bitangents;
        const texcoords = jsonFileData.meshes[0].texturecoords[0];

        // Store all of the necessary indexes into the buffer for rendering later
        const indices = [].concat(...jsonFileData.meshes[0].faces);
        this.indexCount = indices.length;

        // Create the position and color information for this object and send it to the GPU
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verts), this.gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);
        
        this.tangentBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tangentBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tangents), this.gl.STATIC_DRAW);

        this.bitangentBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bitangentBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bitangents), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
    }

    // -----------------------------------------------------------------------------
    render(shaderProgram) {
        const attributes = shaderProgram.attributes;
        const uniforms   = shaderProgram.uniforms;

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(attributes.vertexPosition);
        this.gl.vertexAttribPointer(attributes.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);

        if (attributes.vertexTexCoord !== undefined) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
            this.gl.enableVertexAttribArray(attributes.vertexTexCoord);
            this.gl.vertexAttribPointer(attributes.vertexTexCoord, 2, this.gl.FLOAT, false, 0, 0);
        }
        if (attributes.vertexNormal !== undefined) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.enableVertexAttribArray(attributes.vertexNormal);
            this.gl.vertexAttribPointer(attributes.vertexNormal, 3, this.gl.FLOAT, false, 0, 0);
        }
        if (attributes.vertexTangent !== undefined) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tangentBuffer);
            this.gl.enableVertexAttribArray(attributes.vertexTangent);
            this.gl.vertexAttribPointer(attributes.vertexTangent, 3, this.gl.FLOAT, false, 0, 0);
        }
        if (attributes.vertexBitangent !== undefined) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bitangentBuffer);
            this.gl.enableVertexAttribArray(attributes.vertexBitangent);
            this.gl.vertexAttribPointer(attributes.vertexBitangent, 3, this.gl.FLOAT, false, 0, 0);
        }

        this.gl.uniformMatrix4fv(uniforms.worldMatrix, false, this.getWorldMatrix().transpose().elements);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);


        if (attributes.vertexNormal !== undefined) {
            this.gl.disableVertexAttribArray(attributes.vertexNormal);
        }
        if (attributes.vertexTangent !== undefined) {
            this.gl.disableVertexAttribArray(attributes.vertexTangent);
        }
        if (attributes.vertexBitangent !== undefined) {
            this.gl.disableVertexAttribArray(attributes.vertexBitangent);
        }
        if (attributes.vertexTexCoord !== undefined) {
            this.gl.disableVertexAttribArray(attributes.vertexTexCoord);
        }
        this.gl.disableVertexAttribArray(attributes.vertexPosition);
    }
}