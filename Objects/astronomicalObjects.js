class Sphere {
    constructor(gl, geometryJSON, scaleMatrix) {
        this.gl = gl;
        this.geometry = new Geometry(gl, new Matrix4(), new Matrix4(), scaleMatrix);
        this.geometry.create(geometryJSON);
    }

    render(shaderProgram) {
        this.material.sendUniforms(this.gl, shaderProgram.uniforms);
        this.geometry.render(shaderProgram);
    }
}


class Sun extends Sphere {
    constructor(gl, assets) {
        super(gl, assets.sphereJSON, new Matrix4().makeScale(0.1, 0.1, 0.1));

        this.material = new Material(gl, Color.white, 1, assets.sun);
        this.axialRotation = new Matrix4().makeRotationX(7);
        this.revolutionSpeed = rotSpeed(27);
    }

    update(time) {
        const revolutionAngle = time * this.revolutionSpeed;
        const revolution = new Matrix4().makeRotationY(revolutionAngle);
        this.geometry.rotation = this.axialRotation.clone().multiply(revolution);
    }
}


class Planet extends Sphere {
    constructor(gl, sphere, scale = 0.02, distance = 10, axialTilt = 0, orbitSpeed = 10, revolutionSpeed = 5, texture1 = null, texture2 = null, texture3 = null) {
        super(gl, sphere, new Matrix4().makeScale(scale, scale, scale));

        this.distance = distance;
        this.orbitSpeed = orbitSpeed;
        this.revolutionSpeed = revolutionSpeed;
        this.axialRotation = new Matrix4().makeRotationX(axialTilt);

        this.material = new Material(gl, Color.white, 1, texture1, texture2, texture3);
    }

    update(time) {
        const orbitAngle = time * this.orbitSpeed * Math.PI / 180;
        this.geometry.translation = new Matrix4().makeTranslation(this.distance * Math.cos(orbitAngle),
                                                                0, this.distance * Math.sin(orbitAngle));
        const revolutionAngle = time * this.revolutionSpeed;
        const revolution = new Matrix4().makeRotationY(revolutionAngle);
        this.geometry.rotation = this.axialRotation.clone().multiply(revolution);
    }
}


class Moon extends Planet {
    constructor(gl, sphere, pGeometry, scale = 0.02, distance = 10, axialTilt = 0, orbitSpeed = 10, revolutionSpeed = 5, texture1 = null, texture2 = null, texture3 = null) {
        super(gl, sphere, scale, distance, axialTilt, orbitSpeed, revolutionSpeed, texture1, texture2, texture3);
        this.pGeometry = pGeometry;
    }

    update(time) {
        const orbitAngle = time * this.orbitSpeed * Math.PI / 180;
        const orbit = new Matrix4().makeTranslation(this.distance * Math.cos(orbitAngle), 0, this.distance * Math.sin(orbitAngle));
        this.geometry.translation = orbit.multiply(this.pGeometry.translation);

        const revolutionAngle = time * this.revolutionSpeed;
        const revolution = new Matrix4().makeRotationY(revolutionAngle);
        this.geometry.rotation = this.axialRotation.clone().multiply(revolution);
    }
}


class Rings {
    constructor(gl, pGeometry, scale, axialRotation, texture, alpha) {
        this.gl = gl;

        const rotation = axialRotation.clone().multiply(new Matrix4().makeRotationX(-90));
        this.geometry = new Quad(gl, pGeometry.translation, rotation, scale);
        this.geometry.create();

        this.material = new Material(gl, Color.white, alpha, texture);
        this.pGeometry = pGeometry;
    }

    update() {
        this.geometry.translation = this.pGeometry.translation;
    }

    render(shaderProgram) {
        this.material.sendUniforms(this.gl, shaderProgram.uniforms);
        this.geometry.render(shaderProgram);
    }
}