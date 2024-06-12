import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// createa a new scene: this holds the objects to be rendered
const scene = new THREE.Scene();

// create a new perspective: this defines the view of the scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 30);
camera.lookAt(0,0,0);

// create a renderer: which will render the scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setAnimationLoop( animate );

// add renderer canvas element to html body so it can be displayed in browser
document.body.appendChild( renderer.domElement );


const geometry = new THREE.SphereGeometry( 10, 32, 32 );
// const material = new THREE.MeshBasicMaterial( { color: 0xff69b4 } );
// const sphere = new THREE.Mesh( geometry, material );
const material = new THREE.PointsMaterial(
    {
        color: 'rgb(255, 255, 255)',
        size: 0.25
    }
);
const sphere = new THREE.Points(geometry, material);
scene.add( sphere );


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