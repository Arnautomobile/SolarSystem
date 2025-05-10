precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

uniform sampler2D uTexture;
uniform sampler2D uNormalMap;
uniform sampler2D uSpecularMap;
uniform int uHasNormalMap;
uniform int uHasSpecularMap;

varying vec2 vTexCoord;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;


void main(void) {
    vec3 N = normalize(vNormal);
    vec3 albedo = texture2D(uTexture, vTexCoord).rgb;

    if (uHasNormalMap == 1) {
        vec3 texNormal = normalize(texture2D(uNormalMap, vTexCoord).rgb * 2.0 - 1.0);
        mat3 TBN = mat3(normalize(vTangent), normalize(vBitangent), N);
        N = TBN * texNormal;
    }

    vec3 L = normalize(uLightPosition - vWorldPosition);
    vec3 V = normalize(uCameraPosition - vWorldPosition);
    float diffuse = max(dot(N, L), 0.0);
    float specular = 0.0;

    if (uHasSpecularMap == 1) {
        vec3 H = normalize(L + V);
        specular = pow(max(dot(N, H), 0.0), 32.0);
    }

    vec3 finalColor = diffuse * albedo + specular * vec3(0.5);
    gl_FragColor = vec4(finalColor, 0.0);
}