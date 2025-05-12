'use strict'

const time = new Time();
const input = new Input();
const assetLoader = new AssetLoader();
const projectionMatrix = new Matrix4();


let timeSpeed = 1;
const timeSlider = document.getElementById("timeSlider");
const timeDisplay = document.getElementById("timeValue");

timeSlider.addEventListener("input", () => {
    timeSpeed = timeSlider.valueAsNumber;
    timeDisplay.textContent = timeSpeed + " days";
});

let camera = new OrbitCamera(input);
const fovSlider = document.getElementById("fovSlider");
const fovDisplay = document.getElementById("fovValue");

fovSlider.addEventListener("input", () => {
    camera.fov = fovSlider.valueAsNumber;
    updateFovDisplay();
});

function updateFovDisplay() {
    const fov = parseInt(camera.fov)
    fovSlider.value = fov;
    fovDisplay.textContent = fov;
}


let gl;
let sun;
let sunShaderProgram;
let planetShaderProgram;
let changedCamera = false;
let cameraIsOrbit = true;

const planets = [];
const transparency = [];

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
    { name: 'skybox_px', url: './Data/SkyboxFaces/GalaxyTex_PositiveX.png', type: 'image' },
    { name: 'skybox_nx', url: './Data/SkyboxFaces/GalaxyTex_NegativeX.png', type: 'image' },
    { name: 'skybox_py', url: './Data/SkyboxFaces/GalaxyTex_PositiveY.png', type: 'image' },
    { name: 'skybox_ny', url: './Data/SkyboxFaces/GalaxyTex_NegativeY.png', type: 'image' },
    { name: 'skybox_pz', url: './Data/SkyboxFaces/GalaxyTex_PositiveZ.png', type: 'image' },
    { name: 'skybox_nz', url: './Data/SkyboxFaces/GalaxyTex_NegativeZ.png', type: 'image' }
];


window.onload = window['initialize'];
async function initialize() {
    gl = getWebGLContext("webgl-canvas");
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    await assetLoader.loadAssets(assetList);

    createPlanetShaders();
    createSunShaders();
    createSkyboxShaders();

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

function createSkyboxShaders() {
    
}

function createSkyboxCubemap(gl, assets) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, image: assets.skybox_px },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, image: assets.skybox_nx },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, image: assets.skybox_py },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, image: assets.skybox_ny },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, image: assets.skybox_pz },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, image: assets.skybox_nz },
    ];

    faceInfos.forEach((face) => {
        gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, face.image);
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
}


function rotationSpeed(days) {
    // base time is 1 sec == 1 day in real world
    // one rotation is 360 degrees so we divide it by the number of days to do it
    return 360 / days;
}

function createScene() {
    const assets = assetLoader.assets;
    const sphere = assets.sphereJSON;

    sun = new Sun(gl, assets);
    camera.changeTarget(sun.geometry);

    let mercury = new Planet(gl, sphere, 0.01, 11, 0, rotationSpeed(88), rotationSpeed(59), assets.mercury);
    planets.push(mercury);
    let venus = new Planet(gl, sphere, 0.014, 17, 3, rotationSpeed(225), rotationSpeed(243), assets.venus);
    planets.push(venus);
    let earth = new Planet(gl, sphere, 0.015, 24, 23, rotationSpeed(365), rotationSpeed(1), assets.earth);
    planets.push(earth);
    let mars = new Planet(gl, sphere, 0.012, 31, 25, rotationSpeed(687), rotationSpeed(1), assets.mars);
    planets.push(mars);
    let jupiter = new Planet(gl, sphere, 0.04, 41, 3, rotationSpeed(4333), rotationSpeed(0.41), assets.jupiter);
    planets.push(jupiter);
    let saturn = new Planet(gl, sphere, 0.03, 52, 27, rotationSpeed(10759), rotationSpeed(0.45), assets.saturn);
    planets.push(saturn);
    let uranus = new Planet(gl, sphere, 0.025, 65, 97, rotationSpeed(30687), rotationSpeed(0.72), assets.uranus);
    planets.push(uranus);
    let neptune = new Planet(gl, sphere, 0.025, 80, 28, rotationSpeed(60190), rotationSpeed(0.67), assets.neptune);
    planets.push(neptune);

    let moon = new Moon(gl, sphere, earth.geometry, 0.008, 3, 7, rotationSpeed(27), rotationSpeed(-27), assets.moon);
    planets.push(moon);
}


function updateAndRender() {
    requestAnimationFrame(updateAndRender);
    manageCamera();

    time.update(timeSpeed);

    sun.update(time.seconds);
    planets.forEach(planet => {
        planet.update(time.seconds);
    });

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
    if (input.space && !changedCamera) {
        if (cameraIsOrbit) {
            var newCamera = new Camera(input);
            newCamera.position = camera.getPosition();
            newCamera.yaw = camera.yaw;
            newCamera.pitch = camera.pitch;
        }
        else {
            var newCamera = new OrbitCamera(input, sun.geometry);
        }

        newCamera.fov = camera.fov;
        camera = newCamera;
        changedCamera = true;
        cameraIsOrbit = !cameraIsOrbit;
    }
    if (!input.space && changedCamera) {
        changedCamera = false;
    }
}


function changePlanet(index) {
    if (index < 0 || index > 9) return;

    if (!cameraIsOrbit) {
        let newCamera = new OrbitCamera(input);
        newCamera.fov = camera.fov;
        camera = newCamera;
        cameraIsOrbit = true;
    }

    if (index == 9) {
        camera.changeTarget(sun.geometry);
    }
    else {
        camera.changeTarget(planets[index].geometry);
    }
}