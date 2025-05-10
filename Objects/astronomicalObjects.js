class Sphere {
    constructor(gl, sphere, scale) {
        this.gl = gl;
        this.geometry = new Geometry(gl, new Matrix4(), new Matrix4(), scale);
        this.geometry.create(sphere);
    }

    render(shaderProgram) {
        this.material.sendUniforms(this.gl, shaderProgram.uniforms);
        this.geometry.render(shaderProgram);
    }
}


class Sun extends Sphere {
    constructor(gl, assets) {
        super(gl, assets.sphereJSON, new Matrix4().makeScale(0.05, 0.05, 0.05));
        this.material = new Material(gl, Color.white, 1, assets.sun);
    }

    render(shaderProgram) {
        this.material.sendUniforms(this.gl, shaderProgram.uniforms);
        this.geometry.render(shaderProgram);
    }
}


class Planet extends Sphere {
    constructor(gl, sphere, scale, distance = 5, orbitSpeed = 1, revolutionSpeed = 1, texture = null, normalMap = null, specularMap = null) {
        super(gl, sphere, scale);

        this.distance = distance;
        this.orbitSpeed = orbitSpeed;
        this.revolutionSpeed = revolutionSpeed;

        this.material = new Material(gl, Color.white, 1, texture, normalMap, specularMap);
    }

    update(seconds) {
        let orbitAngle = seconds * this.orbitSpeed
        this.geometry.translation = new Matrix4().makeTranslation(this.distance * Math.cos(orbitAngle),
                                                                0, this.distance * Math.sin(orbitAngle));
        let revolutionAngle = seconds * this.revolutionSpeed;
        this.geometry.rotation = new Matrix4().makeRotationY(revolutionAngle);
    }

    render(shaderProgram) {
        this.material.sendUniforms(this.gl, shaderProgram.uniforms);
        this.geometry.render(shaderProgram);
    }
}


class Moon extends Planet {

}