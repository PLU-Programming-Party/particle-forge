import * as THREE from 'three';

// createa a new scene: this holds the objects to be rendered
const scene = new THREE.Scene();

// create a new perspective: this defines the view of the scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// create a renderer: which will render the scene
const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );

// add renderer canvas element to html body so it can be displayed in browser
document.body.appendChild( renderer.domElement );

// create a box geometry: contains all points of cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// create a material object that defines the color of the geometry
const material = new THREE.MeshBasicMaterial( { color: 0xff69b4 } );

// creat a mesh object: takes geometry and applies material to it
const cube = new THREE.Mesh( geometry, material );


scene.add( cube );

camera.position.z = 5;

function animate() {

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );

}