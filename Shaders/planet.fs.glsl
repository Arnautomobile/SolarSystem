precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uNormalMap;
uniform sampler2D uFlowMap;
uniform int uHasNormalMap;
uniform int uHasFlowMap;

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

    vec3 L = normalize(- vWorldPosition);
    float diffuse = max(dot(N, L), 0.0);

    if (uHasFlowMap == 1) {
        
    }

    vec3 finalColor = diffuse * albedo;
    gl_FragColor = vec4(finalColor, 0.0);
}