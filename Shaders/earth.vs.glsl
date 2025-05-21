precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vWorldPosition;
varying vec2 vTexCoord;
varying vec3 vNormal;


void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    vWorldPosition = (uWorldMatrix * vec4(aVertexPosition, 1.0)).xyz;
    vNormal = (uWorldMatrix * vec4(aNormal, 0.0)).xyz;
    vTexCoord = aTexCoord;
}
