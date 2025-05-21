precision mediump float;

uniform vec3 uCameraPosition;
uniform sampler2D uTextureDay;
uniform sampler2D uSpecularMap;
uniform sampler2D uTextureNight;

varying vec3 vWorldPosition;
varying vec2 vTexCoord;
varying vec3 vNormal;


void main(void) {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(- vWorldPosition);
    vec3 V = normalize(uCameraPosition - vWorldPosition);

    float margin = 0.3;
    float illumination = dot(N, L);

    vec3 dayColor = texture2D(uTextureDay, vTexCoord).rgb;
    vec3 nightColor = texture2D(uTextureNight, vTexCoord).rgb;
    
    float blend = smoothstep(-margin, margin, illumination);
    illumination = illumination * (1.0 - margin) + margin;
    
    vec3 finalColor = mix(nightColor, dayColor * max(illumination, 0.0), blend);
    

    // sample from specular map
    // vec3 H = normalize(L + V);
    // float specular = pow(max(dot(N, H), 0.0), 32.0);

    gl_FragColor = vec4(finalColor, 0.0);
}