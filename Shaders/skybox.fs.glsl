precision mediump float;
varying vec3 vDirection;
uniform samplerCube uSkybox;

void main() {
    gl_FragColor = textureCube(uSkybox, normalize(vDirection));
}