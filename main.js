import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Sphere from './Sphere.js'; 

let raycaster;
let mouse = new THREE.Vector2();

function init(spheres) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    spheres.forEach((sphereData, index) => {
        const [color, size] = sphereData;
        const sphere = new Sphere(color, size); 
        sphere.setPosition((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25);
        scene.add(sphere.getSphereObject()); 
    });

    raycaster = new THREE.Raycaster();

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    orbit.update();

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);


    // this function logs the id of a sphere when it is HOVERED over
    function onMouseHover(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            if (object instanceof THREE.Points) { 
                console.log("Clicked Sphere ID:", object.userData.id);
            }
        }
    }

    //window.addEventListener("mousemove", onMouseHover);


    // this function logs the id of a sphere when it is CLICKED
    function onMouseDown(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
    
        for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            if (object instanceof THREE.Points && object.userData && object.userData.id !== undefined) {
                console.log("Clicked Sphere ID:", object.userData.id);
            }
        }
    }

    window.addEventListener("mousedown", onMouseDown);



    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}

const spheres = [
    [0xff69b4, 2],
    [0x00ff00, 3]
];

init(spheres);
