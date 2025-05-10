precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBitangent;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;


void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    vWorldPosition = (uWorldMatrix * vec4(aVertexPosition, 1.0)).xyz;
    vTexCoord = aTexCoord;
    
    vNormal = (uWorldMatrix * vec4(aNormal, 0.0)).xyz;
    vTangent = (uWorldMatrix * vec4(aTangent, 0.0)).xyz;
    vBitangent = (uWorldMatrix * vec4(aBitangent, 0.0)).xyz;
}
