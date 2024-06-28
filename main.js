document.getElementById("modal").classList.add("hidden");

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import particle from 'particle.js';

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
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        time: { value: 0 },
    }
});
//const manager = new THREE.LoadingManager();

function init(spheres) {

    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sphereMeshes = spheres.map((sphereData) => {
        const [color, size, pos_x, pos_y, pos_z, id] = [sphereData.color, sphereData.size, sphereData.pos_x, sphereData.pos_y, sphereData.pos_z, sphereData.id];
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = toString(id);

        sphere.position.x = pos_x;
        sphere.position.y = pos_y;
        sphere.position.z = pos_z;
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
var usedIds = []
function rande() {
    return ((Math.random() - 0.5) * 25);
}
function gennewId() {
    let newint = Math.floor(Math.random() * 10000)
    while (usedIds.includes(newint)) {
        let newint = Math.floor(Math.random() * 10000)
    }
    usedIds.push(newint); return newint;
}
var spheres = [
    new particle(0xff69b4, 2, rande(), rande(), rande(), gennewId()),
    new particle(0x00ff00, 3, rande(), rande(), rande(), gennewId()),
    new particle(0x0000ff, 1.5, rande(), rande(), rande(), gennewId()),
    new particle(0xffff00, 2.5, rande(), rande(), rande(), gennewId()),
    new particle(0xff00ff, 1, rande(), rande(), rande(), gennewId())
];


function addNewSphere() {
    document.getElementById("modal").classList.remove("hidden"); 
    $(document).ready(function() {
        $("#submitbtn").on("click", function (event) {
            event.preventDefault();
            const formData = {
                pos_x: parseInt($("#n1").val()),
                pos_y: parseInt($("#n2").val()),
                pos_z: parseInt($("#n3").val()),
                size: parseFloat($("#size").val()),
                color: $("#choosecolor").val(),
            };
            console.log(formData)
            const obj = new particle(formData["color"], formData["size"], formData["pos_x"], formData["pos_y"], formData["pos_z"], gennewId());
            spheres.push(obj);
            obj.updateParticle();
            document.getElementById("modal").classList.add("hidden");
            $('#question-form').each(function(){this.reset();});
        })
    })
    //const [pos_x, pos_y, pos_z] = prompt("positions").split(' ');
    //const obj = new particle(0xff69b4, parseFloat(prompt("size")), parseInt(pos_x), parseInt(pos_y), parseInt(pos_z), gennewId())
    //spheres.push(obj);
    //obj.updateParticle();
}

init(spheres);

window.onload = function() {addNewSphere();};
//setInterval(function () {spheres[0].movement("right");}, 3000)

document.addEventListener("keydown", function(event) {
    if (event.key == '.') {
        addNewSphere();
    }
})