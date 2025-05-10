'use strict'

let gl;
let planetShaderProgram;
let sunShaderProgram;

const time = new Time();
const input = new Input();
const assetLoader = new AssetLoader();
const projectionMatrix = new Matrix4();

let sun;
const planets = [];
const moons = [];

let camera = new OrbitCamera(input);
let changedCamera = false;
let cameraIsOrbit = true;
let lightPosition = Vector3.zero.clone();


const assetList = [
    { name: 'planetTextVS', url: './Shaders/planet.vs.glsl', type: 'text' },
    { name: 'planetTextFS', url: './Shaders/planet.fs.glsl', type: 'text' },
    { name: 'sunTextVS', url: './Shaders/sun.vs.glsl', type: 'text' },
    { name: 'sunTextFS', url: './Shaders/sun.fs.glsl', type: 'text' },

    { name: 'sphereJSON', url: './Data/sphere.json', type: 'json' },
    { name: 'waterNormalMap', url: './Data/waterNormalMap.jpeg', type: 'image' },
    { name: 'sun', url: './Data/sun.jpg', type: 'image' },
    { name: 'mercury', url: './Data/mercury.jpg', type: 'image' },
    { name: 'venus', url: './Data/venus.jpg', type: 'image' },
    { name: 'earth', url: './Data/earth.jpg', type: 'image' },
    { name: 'mars', url: './Data/mars.jpg', type: 'image' },
    { name: 'jupiter', url: './Data/jupiter.jpg', type: 'image' },
    { name: 'saturn', url: './Data/saturn.jpg', type: 'image' },
    { name: 'uranus', url: './Data/uranus.jpg', type: 'image' },
    { name: 'neptune', url: './Data/neptune.jpg', type: 'image' },
    { name: 'moon', url: './Data/moon.png', type: 'image' },
];


window.onload = window['initialize'];
async function initialize() {
    gl = getWebGLContext("webgl-canvas");
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    await assetLoader.loadAssets(assetList);

    createPlanetShaders();
    createSunShaders();

    createScene();
    updateAndRender();
}


function createPlanetShaders() {
    const planetTextVS = assetLoader.assets.planetTextVS;
    const planetTextFS = assetLoader.assets.planetTextFS;

    planetShaderProgram = createShaderProgram(gl, planetTextVS, planetTextFS);

    planetShaderProgram.attributes = {
        vertexPosition: gl.getAttribLocation(planetShaderProgram, "aVertexPosition"),
        vertexTexCoord: gl.getAttribLocation(planetShaderProgram, "aTexCoord"),
        vertexNormal: gl.getAttribLocation(planetShaderProgram, "aNormal"),
        vertexTangent: gl.getAttribLocation(planetShaderProgram, "aTangent"),
        vertexBitangent: gl.getAttribLocation(planetShaderProgram, "aBitangent")
    };

    planetShaderProgram.uniforms = {
        worldMatrix: gl.getUniformLocation(planetShaderProgram, "uWorldMatrix"),
        viewMatrix: gl.getUniformLocation(planetShaderProgram, "uViewMatrix"),
        projectionMatrix: gl.getUniformLocation(planetShaderProgram, "uProjectionMatrix"),
        lightPosition: gl.getUniformLocation(planetShaderProgram, "uLightPosition"),
        cameraPosition: gl.getUniformLocation(planetShaderProgram, "uCameraPosition"),

        texture: gl.getUniformLocation(planetShaderProgram, "uTexture"),
        normalMap: gl.getUniformLocation(planetShaderProgram, "uNormalMap"),
        specularMap: gl.getUniformLocation(planetShaderProgram, "uSpecularMap"),
        hasNormalMap: gl.getUniformLocation(planetShaderProgram, "uHasNormalMap"),
        hasSpecularMap: gl.getUniformLocation(planetShaderProgram, "uHasSpecularMap")
    };
}

function createSunShaders() {
    const sunTextVS = assetLoader.assets.sunTextVS;
    const sunTextFS = assetLoader.assets.sunTextFS;

    sunShaderProgram = createShaderProgram(gl, sunTextVS, sunTextFS);

    sunShaderProgram.attributes = {
        vertexPosition: gl.getAttribLocation(sunShaderProgram, "aVertexPosition"),
        vertexTexCoord: gl.getAttribLocation(sunShaderProgram, "aTexCoord"),
    };

    sunShaderProgram.uniforms = {
        worldMatrix: gl.getUniformLocation(sunShaderProgram, "uWorldMatrix"),
        viewMatrix: gl.getUniformLocation(sunShaderProgram, "uViewMatrix"),
        projectionMatrix: gl.getUniformLocation(sunShaderProgram, "uProjectionMatrix"),
        texture: gl.getUniformLocation(sunShaderProgram, "uTexture"),
    };
}


function createScene() {
    const assets = assetLoader.assets
    sun = new Sun(gl, assets);

    let mercury = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.01, 0.01, 0.01), 7, 0.6, 20, assets.mercury);
    planets.push(mercury);
    let venus = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.014, 0.014, 0.014), 12, 0.7, 10, assets.venus);
    planets.push(venus);
    let earth = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.015, 0.015, 0.015), 16, 0.5, 50, assets.earth);
    planets.push(earth);
    let mars = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.012, 0.012, 0.012), 21, 0.4, 40, assets.mars);
    planets.push(mars);
    let jupiter = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.03, 0.03, 0.03), 28, 0.15, 10, assets.jupiter);
    planets.push(jupiter);
    let saturn = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.026, 0.026, 0.026), 35, 0.2, 15, assets.saturn);
    planets.push(saturn);
    let uranus = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.021, 0.021, 0.021), 42, 0.12, 7, assets.uranus);
    planets.push(uranus);
    let neptune = new Planet(gl, assets.sphereJSON, new Matrix4().makeScale(0.021, 0.021, 0.021), 46, 0.1, 5, assets.neptune);
    planets.push(neptune);

    
}


function updateAndRender() {
    requestAnimationFrame(updateAndRender);
    manageCamera();

    time.update();
    camera.update(time.deltaTime);
    const cameraPos = camera.getPosition();
    const viewMatrix = camera.getViewMatrix();
    projectionMatrix.makePerspective(camera.fov, gl.canvasWidth/gl.canvasHeight, 0.1, 1000);

    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // -------------------------------------------------------------------------------------------
    gl.useProgram(sunShaderProgram);
    let uniforms = sunShaderProgram.uniforms;

    gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);
    sun.render(sunShaderProgram);


    // -------------------------------------------------------------------------------------------
    gl.useProgram(planetShaderProgram);
    uniforms = planetShaderProgram.uniforms;

    gl.uniform3f(uniforms.cameraPosition, cameraPos.x, cameraPos.y, cameraPos.z);
    gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);

    planets.forEach(planet => {
        planet.update(time.seconds);
        planet.render(planetShaderProgram);
    });


    // Use for atmospheres :

    /*gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const sorted = transparency.sort((a,b) => {
        const distA = Vector3.distance(a.getPosition(), cameraPos);
        const distB = Vector3.distance(b.getPosition(), cameraPos);
        return distB - distA;
    });
    
    sorted.forEach(element => {
        element.render(planetShaderProgram);
    });

    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);*/
}



function manageCamera() {
    if (input.shift && !changedCamera) {
        if (cameraIsOrbit) {
            var newCamera = new Camera(input);
            newCamera.position = camera.getPosition();
            newCamera.yaw = camera.yaw;
            newCamera.pitch = camera.pitch;
        }
        else {
            var newCamera = new OrbitCamera(input);
        }

        newCamera.fov = camera.fov;
        camera = newCamera;
        changedCamera = true;
        cameraIsOrbit = !cameraIsOrbit;
    }
    if (!input.shift && changedCamera) {
        changedCamera = false;
    }
}