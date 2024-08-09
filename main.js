document.getElementById("modal").classList.add("hidden");
var modalopen = false;

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadShader } from './src/utility/shaderLoader';
import { WebGPURenderer } from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';

let shaderText = await loadShader('src/shaders/vert.wgsl');
console.log(shaderText);

const renderer = new THREE.WebGPURenderer();

// Vertex shader code
const vertexShader = "";

// Fragment shader code
const fragmentShader = "";

let raycaster;
let mouse = new THREE.Vector2();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        time: { value: 0 },
    }
});

/* class particle {
    static sphereCount = 0;
    static selectedid = null;
    constructor(color, size, pos_x, pos_y, pos_z) {
        this.color = color; this.size = size; this.id = particle.sphereCount++;
        this.pos_x = pos_x; this.pos_y = pos_y; this.pos_z = pos_z;
        this.geometry = new THREE.SphereGeometry(size, 32, 32);
        this.material = new THREE.PointsMaterial({
            color: color,
            size: 0.1,
        });
        //this.material = material;
        this.sphereObject = new THREE.Points(this.geometry, this.material);
        this.sphereObject.userData.id = this.id;
        this.sphereObject.userData.paused = true;
        this.sphereObject.name = this.id.toString();
        this.interval = setInterval(() => this.rotation(), 50)
        this.sphereObject.userData.pauser = () => {this.sphereObject.userData.paused = true;}
    }
    rotation() {
        if (!this.sphereObject.userData.paused) {
            this.sphereObject.rotation.x += 0.1;
        }
    }
    getSphereObject() {return this.sphereObject;}
    setPosition(xpos, ypos, zpos) {
        this.sphereObject.position.set(xpos, ypos, zpos);
    }
    movement(direction) {
        let movementamount = 3;
        switch(direction) {
            case "right":
                this.pos_x += movementamount; break;
            case "left":
                this.pos_x -= movementamount; break;
            case "up":
                this.pos_y += movementamount; break;
            case "down":
                this.pos_y -= movementamount; break;
            case "back":
                this.pos_z -= movementamount; break;
            case "forward":
                this.pos_z += movementamount; break;
            default:
                break;
        }
        this.setPosition(this.pos_x, this.pos_y, this.pos_z);
        let obj = scene.getObjectByName(this.id.toString()); 
        obj.needsUpdate = true;
        console.log(spheres); 
    }
    updateParticle() {
        const [color, size, pos_x, pos_y, pos_z, id] = [this.color, this.size, this.pos_x, this.pos_y, this.pos_z, this.id];
        this.sphereObject.name = id.toString();
        this.setPosition(pos_x, pos_y, pos_z);
        scene.add(this.getSphereObject());
    }
} */

//const manager = new THREE.LoadingManager();

// function init(spheres) {

//     camera.position.set(0, 0, 30);
//     camera.lookAt(0, 0, 0);

//     var renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.body.appendChild(renderer.domElement);

//     const sphereMeshes = spheres.map((sphere) => {
//         sphere.setPosition(sphere.pos_x, sphere.pos_y, sphere.pos_z);
//         sphere.sphereObject.name = sphere.id.toString();
//         scene.add(sphere.getSphereObject());
//         return sphere;
//     });
//     raycaster = new THREE.Raycaster();
//     const orbit = new OrbitControls(camera, renderer.domElement);
//     orbit.target.set(0, 0, 0);
//     orbit.update();

//     const onWindowResize = () => {
//         camera.aspect = window.innerWidth / window.innerHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener("resize", onWindowResize);
//     /*function onMouseHover(event) {
//         mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//         mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//         raycaster.setFromCamera(mouse, camera);
//         const intersects = raycaster.intersectObjects(scene.children);

//         for (let i = 0; i < intersects.length; i++) {
//             const object = intersects[i].object;
//             if (object instanceof THREE.Points) { 
//                 console.log("Clicked Sphere ID:", object.userData.id);
//             }
//         }
//     }*/

//     //window.addEventListener("mousemove", onMouseHover);


//     // this function logs the id of a sphere when it is CLICKED
//     function onMouseDown(event) {
//         if (!modalopen) {
//             mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//             mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//             raycaster.setFromCamera(mouse, camera);
//             const intersects = raycaster.intersectObjects(scene.children);
//             let found = false;
//             for (let i = 0; i < intersects.length; i++) {
//                 const object = intersects[i].object;
//                 if (object instanceof THREE.Points && object.userData && object.userData.id !== undefined) {
//                     console.log("Clicked Sphere ID:", object.userData.id); found = true;
//                     let obj2 = 3;
//                     if (particle.selectedid != null) {
//                         obj2 = scene.getObjectByName(particle.selectedid.toString());
//                         obj2.userData.pauser();
//                     }
//                     particle.selectedid = object.userData.id;
//                     //console.log(scene.children)
//                     object.userData.paused = false;
                    

//                     break;
//                 }
//             }
//             if (!found) {
//                 let obj2 = scene.getObjectByName(particle.selectedid.toString());
//                 obj2.userData.pauser();
//             }
//         }
//     }

//     window.addEventListener("mousedown", onMouseDown);
//     let clock = new THREE.Clock();

//     function animate() {
//         requestAnimationFrame(animate);

//         /*const elapsedTime = clock.getElapsedTime();
//         sphereMeshes.forEach((sphere) => {
//             sphere.material.uniforms.time.value = elapsedTime;
//         });*/

//         renderer.render(scene, camera);
//     }

//     animate();
// }
// var usedIds = []
// function rande() {
//     return ((Math.random() - 0.5) * 25);
// }
// var spheres = [
//     new particle(0xff69b4, 2, rande(), rande(), rande()),
//     new particle(0x00ff00, 3, rande(), rande(), rande()),
//     new particle(0x0000ff, 1.5, rande(), rande(), rande()),
//     new particle(0xffff00, 2.5, rande(), rande(), rande()),
//     new particle(0xff00ff, 1, rande(), rande(), rande())
// ];


// function addNewSphere() {
//     modalopen = true;
//     document.getElementById("modal").classList.remove("hidden"); 
//     $(document).ready(function() {
//         $("#submitbtn").on("click", function (event) {
//             event.preventDefault();
//             const formData = {
//                 pos_x: parseInt($("#n1").val()),
//                 pos_y: parseInt($("#n2").val()),
//                 pos_z: parseInt($("#n3").val()),
//                 size: parseFloat($("#size").val()),
//                 color: $("#choosecolor").val(),
//             };
        
//             const obj = new particle(formData["color"], formData["size"], formData["pos_x"], formData["pos_y"], formData["pos_z"]);
//             spheres.push(obj);
//             obj.updateParticle();
//             document.getElementById("modal").classList.add("hidden");
//             modalopen = false;
//             $('#question-form').each(function(){this.reset();});
//         })
//     })
//     //const [pos_x, pos_y, pos_z] = prompt("positions").split(' ');
//     //const obj = new particle(0xff69b4, parseFloat(prompt("size")), parseInt(pos_x), parseInt(pos_y), parseInt(pos_z), gennewId())
//     //spheres.push(obj);
//     //obj.updateParticle();
// }

// init(spheres);

// window.onload = function() {addNewSphere();};
//setInterval(function () {spheres[0].movement("right");}, 3000)

document.addEventListener("keydown", function(event) {
    if (event.key == '.') {
        addNewSphere();
    }
})