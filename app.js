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
let earth;
let skyboxBuffer;
let skyboxTexture;
let changedCamera = false;
let cameraIsOrbit = true;

let sunShaderProgram;
let earthShaderProgram;
let planetShaderProgram;
let skyboxShaderProgram;
let transparencyShaderProgram;

const planets = [];
const transparency = []; // for rings and atmosphere

const assetList = [
    { name: 'planetTextVS', url: './Shaders/planet.vs.glsl', type: 'text' },
    { name: 'planetTextFS', url: './Shaders/planet.fs.glsl', type: 'text' },
    { name: 'earthTextFS', url: './Shaders/earth.fs.glsl', type: 'text' },
    { name: 'earthTextVS', url: './Shaders/earth.vs.glsl', type: 'text' },
    { name: 'sunTextVS', url: './Shaders/sun.vs.glsl', type: 'text' },
    { name: 'sunTextFS', url: './Shaders/sun.fs.glsl', type: 'text' },
    { name: 'skyboxTextVS', url: './Shaders/skybox.vs.glsl', type: 'text' },
    { name: 'skyboxTextFS', url: './Shaders/skybox.fs.glsl', type: 'text' },
    { name: 'transparencyTextVS', url: './Shaders/transparency.vs.glsl', type: 'text'},
    { name: 'transparencyTextFS', url: './Shaders/transparency.fs.glsl', type: 'text'},
    
    { name: 'sphereJSON', url: './Data/sphere.json', type: 'json' },
    { name: 'waterNormalMap', url: './Data/waterNormalMap.jpeg', type: 'image' },
    { name: 'skybox_px', url: './Data/SkyboxFaces/GalaxyTex_PositiveX.png', type: 'image' },
    { name: 'skybox_nx', url: './Data/SkyboxFaces/GalaxyTex_NegativeX.png', type: 'image' },
    { name: 'skybox_py', url: './Data/SkyboxFaces/GalaxyTex_PositiveY.png', type: 'image' },
    { name: 'skybox_ny', url: './Data/SkyboxFaces/GalaxyTex_NegativeY.png', type: 'image' },
    { name: 'skybox_pz', url: './Data/SkyboxFaces/GalaxyTex_PositiveZ.png', type: 'image' },
    { name: 'skybox_nz', url: './Data/SkyboxFaces/GalaxyTex_NegativeZ.png', type: 'image' },

    { name: 'earthDay', url: './Data/2k_earth_daymap.jpg', type: 'image' },
    { name: 'earthNight', url: './Data/2k_earth_nightmap.jpg', type: 'image' },
    { name: 'earthClouds', url: './Data/2k_earth_clouds.jpg', type: 'image' },
    { name: 'sun', url: './Data/sun.jpg', type: 'image' },
    { name: 'mercury', url: './Data/mercury.jpg', type: 'image' },
    { name: 'venus', url: './Data/venus.jpg', type: 'image' },
    { name: 'mars', url: './Data/mars.jpg', type: 'image' },
    { name: 'jupiter', url: './Data/jupiter.jpg', type: 'image' },
    { name: 'saturn', url: './Data/saturn.jpg', type: 'image' },
    { name: 'uranus', url: './Data/uranus.jpg', type: 'image' },
    { name: 'neptune', url: './Data/neptune.jpg', type: 'image' },
    { name: 'moon', url: './Data/moon.png', type: 'image' }
];


window.onload = window['initialize'];
async function initialize() {
    gl = getWebGLContext("webgl-canvas");
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    await assetLoader.loadAssets(assetList);

    createSunShaders();
    createEarthShaders();
    createPlanetShaders();
    createTransparencyShaders();

    createSkyboxShaders();
    createSkyboxBuffers();
    createSkyboxCubemap();

    createScene();
    updateAndRender();
}


function createSunShaders() {
    const sunVS = assetLoader.assets.sunTextVS;
    const sunFS = assetLoader.assets.sunTextFS;

    sunShaderProgram = createShaderProgram(gl, sunVS, sunFS);

    sunShaderProgram.attributes = {
        vertexPosition: gl.getAttribLocation(sunShaderProgram, "aVertexPosition"),
        vertexTexCoord: gl.getAttribLocation(sunShaderProgram, "aTexCoord"),
    };

    sunShaderProgram.uniforms = {
        worldMatrix: gl.getUniformLocation(sunShaderProgram, "uWorldMatrix"),
        viewMatrix: gl.getUniformLocation(sunShaderProgram, "uViewMatrix"),
        projectionMatrix: gl.getUniformLocation(sunShaderProgram, "uProjectionMatrix"),
        texture: gl.getUniformLocation(sunShaderProgram, "uTexture"),
        flowMap: gl.getUniformLocation(sunShaderProgram, "uFlowMap")
    };
}

function createEarthShaders() {
    const earthVS = assetLoader.assets.earthTextVS;
    const earthFS = assetLoader.assets.earthTextFS;

    earthShaderProgram = createShaderProgram(gl, earthVS, earthFS);

    earthShaderProgram.attributes = {
        vertexPosition: gl.getAttribLocation(earthShaderProgram, "aVertexPosition"),
        vertexTexCoord: gl.getAttribLocation(earthShaderProgram, "aTexCoord"),
        vertexNormal: gl.getAttribLocation(earthShaderProgram, "aNormal"),
    };

    earthShaderProgram.uniforms = {
        worldMatrix: gl.getUniformLocation(earthShaderProgram, "uWorldMatrix"),
        viewMatrix: gl.getUniformLocation(earthShaderProgram, "uViewMatrix"),
        projectionMatrix: gl.getUniformLocation(earthShaderProgram, "uProjectionMatrix"),
        texture: gl.getUniformLocation(earthShaderProgram, "uTextureDay"),
        specularMap: gl.getUniformLocation(earthShaderProgram, "uSpecularMap"),
        textureNight: gl.getUniformLocation(earthShaderProgram, "uTextureNight"),
    };
}

function createPlanetShaders() {
    const planetVS = assetLoader.assets.planetTextVS;
    const planetFS = assetLoader.assets.planetTextFS;

    planetShaderProgram = createShaderProgram(gl, planetVS, planetFS);

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
        texture: gl.getUniformLocation(planetShaderProgram, "uTexture"),
        normalMap: gl.getUniformLocation(planetShaderProgram, "uNormalMap"),
        flowMap: gl.getUniformLocation(planetShaderProgram, "uFlowMap"),
        hasNormalMap: gl.getUniformLocation(planetShaderProgram, "uHasNormalMap"),
        hasFlowMap: gl.getUniformLocation(planetShaderProgram, "uHasFlowMap")
    };
}

function createTransparencyShaders() {
    const transparencyVS = assetLoader.assets.transparencyTextVS;
    const transparencyFS = assetLoader.assets.transparencyTextFS;

    transparencyShaderProgram = createShaderProgram(gl, transparencyVS, transparencyFS);

    transparencyShaderProgram.attributes = {
        vertexPosition: gl.getAttribLocation(transparencyShaderProgram, "aVertexPosition"),
        vertexTexCoord: gl.getAttribLocation(transparencyShaderProgram, "aTexCoord"),
        vertexNormal: gl.getAttribLocation(transparencyShaderProgram, "aNormal"),
    };

    transparencyShaderProgram.uniforms = {
        worldMatrix: gl.getUniformLocation(transparencyShaderProgram, "uWorldMatrix"),
        viewMatrix: gl.getUniformLocation(transparencyShaderProgram, "uViewMatrix"),
        projectionMatrix: gl.getUniformLocation(transparencyShaderProgram, "uProjectionMatrix"),
        texture: gl.getUniformLocation(transparencyShaderProgram, "uTexture"),
        alpha: gl.getUniformLocation(transparencyShaderProgram, "uAlpha"),
    };
}



function createSkyboxShaders() {
    const skyboxTextVS = assetLoader.assets.skyboxTextVS;
    const skyboxTextFS = assetLoader.assets.skyboxTextFS;

    skyboxShaderProgram = createShaderProgram(gl, skyboxTextVS, skyboxTextFS);

    skyboxShaderProgram.attributes = {
        position: gl.getAttribLocation(skyboxShaderProgram, "aPosition")
    }
    skyboxShaderProgram.uniforms = {
        projectionMatrix: gl.getUniformLocation(skyboxShaderProgram, "uProjectionMatrix"),
        viewMatrix: gl.getUniformLocation(skyboxShaderProgram, "uViewMatrix"),
        skybox: gl.getUniformLocation(skyboxShaderProgram, "uSkybox")
    }
}

function createSkyboxBuffers() {
    const positions = new Float32Array([
        -1, -1, -1,   1, -1, -1,   1,  1, -1,  -1,  1, -1,
        -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1
    ]);

    const indices = new Uint16Array([
        0, 1, 2,  2, 3, 0, // back
        4, 5, 6,  6, 7, 4, // front
        3, 2, 6,  6, 7, 3, // top
        0, 1, 5,  5, 4, 0, // bottom
        1, 2, 6,  6, 5, 1, // right
        0, 3, 7,  7, 4, 0  // left
    ]);

    skyboxBuffer = {
        position: gl.createBuffer(),
        indices: gl.createBuffer(),
        count: indices.length
    };

    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxBuffer.position);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxBuffer.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

function createSkyboxCubemap() {
    const faces = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, image: assetLoader.assets.skybox_px },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, image: assetLoader.assets.skybox_nx },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, image: assetLoader.assets.skybox_py },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, image: assetLoader.assets.skybox_ny },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, image: assetLoader.assets.skybox_pz },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, image: assetLoader.assets.skybox_nz },
    ];

    skyboxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

    faces.forEach((face) => {
        gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, face.image);
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}



function rotSpeed(days) {
    // base time is 1 sec == 1 day in real world
    // one rotation is 360 degrees so we divide it by the number of days to do it
    return 360 / days;
}

function createScene() {
    const assets = assetLoader.assets;
    const sphere = assets.sphereJSON;

    sun = new Sun(gl, assets);
    camera.changeTarget(sun.geometry);
    earth = new Planet(gl, sphere, 0.015, 24, 23, rotSpeed(365), rotSpeed(1), assets.earthDay, null, assets.earthNight);

    let mercury = new Planet(gl, sphere, 0.01, 11, 0, rotSpeed(88), rotSpeed(59), assets.mercury);
    planets.push(mercury);
    let venus = new Planet(gl, sphere, 0.014, 17, 3, rotSpeed(225), rotSpeed(243), assets.venus);
    planets.push(venus);
    let mars = new Planet(gl, sphere, 0.012, 31, 25, rotSpeed(687), rotSpeed(1), assets.mars);
    planets.push(mars);
    let jupiter = new Planet(gl, sphere, 0.04, 41, 3, rotSpeed(4333), rotSpeed(0.41), assets.jupiter);
    planets.push(jupiter);
    let saturn = new Planet(gl, sphere, 0.03, 52, 27, rotSpeed(10759), rotSpeed(0.45), assets.saturn);
    planets.push(saturn);
    let uranus = new Planet(gl, sphere, 0.025, 65, 97, rotSpeed(30687), rotSpeed(0.72), assets.uranus);
    planets.push(uranus);
    let neptune = new Planet(gl, sphere, 0.025, 80, 28, rotSpeed(60190), rotSpeed(0.67), assets.neptune);
    planets.push(neptune);
    let moon = new Moon(gl, sphere, earth.geometry, 0.008, 3, 7, rotSpeed(27), rotSpeed(-27), assets.moon);
    planets.push(moon);

    let saturnRings = new Rings(gl, saturn.geometry, new Matrix4().makeScale(3,3,3), saturn.axialRotation, assets.waterNormalMap, 0.7);
    transparency.push(saturnRings);
}


function updateAndRender() {
    requestAnimationFrame(updateAndRender);
    time.update(timeSpeed);

    sun.update(time.seconds);
    earth.update(time.seconds);

    planets.forEach(planet => {
        planet.update(time.seconds);
    });
    transparency.forEach(object => {
        object.update(time.seconds);
    });
    
    manageCamera();
    camera.update(time.deltaTime);
    const cameraPos = camera.getPosition();
    const viewMatrix = camera.getViewMatrix();
    projectionMatrix.makePerspective(camera.fov, gl.canvasWidth/gl.canvasHeight, 0.1, 1000);


    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    // -------------------------------------------------------------------------------------------
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(skyboxShaderProgram);

    gl.uniformMatrix4fv(skyboxShaderProgram.uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(skyboxShaderProgram.uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxBuffer.position);
    gl.enableVertexAttribArray(skyboxShaderProgram.attributes.position);
    gl.vertexAttribPointer(skyboxShaderProgram.attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxBuffer.indices);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
    gl.uniform1i(skyboxShaderProgram.uniforms.skybox, 0);

    gl.drawElements(gl.TRIANGLES, skyboxBuffer.count, gl.UNSIGNED_SHORT, 0);
    gl.depthFunc(gl.LESS);
    

    // -------------------------------------------------------------------------------------------
    gl.useProgram(sunShaderProgram);
    let uniforms = sunShaderProgram.uniforms;

    gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);
    sun.render(sunShaderProgram);
    
    
    // -------------------------------------------------------------------------------------------
    gl.useProgram(earthShaderProgram);
    uniforms = earthShaderProgram.uniforms;

    gl.uniform3f(uniforms.cameraPosition, cameraPos.x, cameraPos.y, cameraPos.z);
    gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);
    earth.render(earthShaderProgram);


    // -------------------------------------------------------------------------------------------
    gl.useProgram(planetShaderProgram);
    uniforms = planetShaderProgram.uniforms;

    gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);

    planets.forEach(planet => {
        planet.render(planetShaderProgram);
    });


    // Use for atmospheres and rings :

    gl.useProgram(transparencyShaderProgram);
    uniforms = transparencyShaderProgram.uniforms;

    gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix.clone().transpose().elements);
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix.clone().transpose().elements);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const sorted = transparency.sort((a,b) => {
        const distA = Vector3.distance(a.getPosition(), cameraPos);
        const distB = Vector3.distance(b.getPosition(), cameraPos);
        return distB - distA;
    });
    
    sorted.forEach(element => {
        element.render(transparencyShaderProgram);
    });

    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
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
    else if (index == 2) {
        camera.changeTarget(earth.geometry);
    }
    else if (index < 2) {
        camera.changeTarget(planets[index].geometry);
    }
    else {
        camera.changeTarget(planets[index - 1].geometry);
    }
}