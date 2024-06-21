import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Vertex shader code
const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader code
const fragmentShader = `
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
`;

function init(spheres) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sphereMeshes = spheres.map((sphereData) => {
        const [color, size] = sphereData;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                time: { value: 0 },
            }
        });
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.x = (Math.random() - 0.5) * 25;
        sphere.position.y = (Math.random() - 0.5) * 25;
        sphere.position.z = (Math.random() - 0.5) * 25;
        scene.add(sphere);

        return sphere;
    });

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    orbit.update();

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);

    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        sphereMeshes.forEach((sphere) => {
            sphere.material.uniforms.time.value = elapsedTime;
        });

        renderer.render(scene, camera);
    }

    animate();
}

const spheres = [
    [0xff69b4, 2],
    [0x00ff00, 3],
    [0x0000ff, 1.5],
    [0xffff00, 2.5],
    [0xff00ff, 1]
];
init(spheres);

