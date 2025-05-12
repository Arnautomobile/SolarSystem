precision mediump float;

attribute vec3 aPosition;
varying vec3 vDirection;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    vec4 pos = uProjectionMatrix * mat4(mat3(uViewMatrix)) * vec4(aPosition, 1.0);
    gl_Position = pos.xyww;
    vDirection = aPosition;
}
