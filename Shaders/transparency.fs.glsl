precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha; // when above or equal to 0, ignore texture alpha and replace it with this value

varying vec3 vWorldPosition;
varying vec2 vTexCoord;
varying vec3 vNormal;


void main(void) {
    vec4 tex = texture2D(uTexture, vTexCoord);

    vec3 N = normalize(vNormal);
    vec3 L = normalize(- vWorldPosition);
    
    vec3 color = tex.xyz;
    float alpha = uAlpha < 0.0 ? tex.w : uAlpha;



    // float translucency = pow(clamp(dot(normalFront, -L), 0.0, 1.0), 1.5);
    // ringLighting += translucency * 0.5;

    float diffuse = max(dot(N, L), 0.0);
    float scattering = 0.5 * pow(1.0 - dot(N, L), 2.0);

    // Final lighting
    float lighting = diffuse + scattering;
    lighting = clamp(lighting, 0.0, 1.0);

    gl_FragColor = vec4(lighting * color, alpha);
}