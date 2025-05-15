precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uFlowMap;
varying vec2 vTexCoord;

void main(void) {
    gl_FragColor = texture2D(uTexture, vTexCoord);
}