import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function init(spheres) {

// createa a new scene: this holds the objects to be rendered
    const scene = new THREE.Scene();

// create a new perspective: this defines the view of the scene
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

// create a renderer: which will render the scene
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


// // const material = new THREE.MeshBasicMaterial( { color: 0xff69b4 } );
// // const sphere = new THREE.Mesh( geometry, material );

    spheres.forEach((sphereData, index) => {
        const [color, size] = sphereData;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.PointsMaterial(
            {
                color: color,
                size: 0.1
            }
        )
        const sphere = new THREE.Points(geometry, material);

        // position the sphere random
        sphere.position.x = (Math.random() - 0.5) * 25;
        sphere.position.y = (Math.random() - 0.5) * 25;
        sphere.position.z = (Math.random() - 0.5) * 25;
        scene.add(sphere);
    });


    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    //orbit.enableRotate = false;
    orbit.update();

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);


// animation loop
    function animate() {
        requestAnimationFrame(animate);
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