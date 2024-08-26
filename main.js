import { loadShader } from './src/utility/shaderLoader';
import { Sphere, Cube, Plane, Cylinder, Cone } from './src/geometry/simple-geometry';
import { Engine } from './src/engine/engine';
import { Camera } from './src/engine/camera';
import { mat4 } from 'gl-matrix'; // Ensure you have gl-matrix installed
import { Scene } from './src/engine/scene';

/***************************************************************************************************************
 * WEBGPU SETUP
 ***************************************************************************************************************/
const canvas = document.querySelector('canvas');

// Create an engine
const engine = new Engine(canvas);

// Initialize the engine
await engine.initialize();

// Load shaders
const vertexShaderCode = await loadShader('./src/shaders/vert.wgsl');
const fragmentShaderCode = await loadShader('./src/shaders/frag.wgsl');
engine.initPipeline(vertexShaderCode, fragmentShaderCode);

/***************************************************************************************************************
 * SCENE SETUP
 ***************************************************************************************************************/
const scene = new Scene(engine);
const sceneObjects = []; // Store the IDs of created scene objects

// Create a camera
const camera = new Camera(45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);

// Set camera position and orientation
const cameraPosition = [0, 0, 20]; // Position the camera 5 units away from the origin along the z-axis
const lookAtPoint = [0, 0, 0]; // Look at the origin
const upVector = [0, 1, 0]; // Define the up direction
camera.viewMatrix = mat4.lookAt(mat4.create(), cameraPosition, lookAtPoint, upVector);

// Create geometries and add them to the scene
for (let i = 0; i < 10; i++) {
    const mesh = new Cube(0.5, 0.5, 0.5);
    const cube = scene.createSceneObject(mesh);
    sceneObjects.push(cube);
    scene.translateSceneObject(cube, [i, 0, 0]);
}

/***************************************************************************************************************
 * BROWSER FUNCTIONALITY
 ***************************************************************************************************************/
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.context.configure({
        device: engine.device,
        format: engine.canvasFormat,
        size: { width: canvas.width, height: canvas.height }
    });
    camera.projectionMatrix = mat4.perspective(mat4.create(), 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);
    scene.render(camera);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/***************************************************************************************************************
 * MAIN RENDER LOOP
 ***************************************************************************************************************/
while (true) {
    for(let i = 0; i < sceneObjects.length; i++) {
        
    }

    scene.render(camera);
    // delay for 1/60th of a second
    await new Promise(resolve => setTimeout(resolve, 1000 / 60));
}