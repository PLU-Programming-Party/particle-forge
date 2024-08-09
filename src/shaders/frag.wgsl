uniform float time;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float brightness = max(dot(vNormal, light), 0.0);

    // Use time to vary hue
    float hue = fract(time * 0.1 + vPosition.x * 0.1);
    vec3 color = hsv2rgb(vec3(hue, 1.0, 1.0));
    
    vec3 diffuse = brightness * color;
    vec3 ambient = 0.1 * color;
    gl_FragColor = vec4(diffuse + ambient, 1.0);
}