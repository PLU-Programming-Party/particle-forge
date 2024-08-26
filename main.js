import { loadShader } from './src/utility/shaderLoader';
import { Sphere, Cube, Plane, Cylinder, Cone } from './src/geometry/simple-geometry';
import { Engine } from './src/engine/engine';
import { Camera } from './src/engine/camera';
import { mat4 } from 'gl-matrix'; // Ensure you have gl-matrix installed
import { Scene } from './src/engine/scene';


// Create a canvas
const canvas = document.querySelector('canvas');

// Create an engine
const engine = new Engine(canvas);

// Initialize the engine
await engine.initialize();

// Create a camera
const camera = new Camera(45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);

// Function to resize canvas and update camera aspect ratio
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.context.configure({
        device: engine.device,
        format: engine.canvasFormat,
        size: { width: canvas.width, height: canvas.height }
    });
    camera.projectionMatrix = mat4.perspective(mat4.create(), 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100);
    render();
}

const vertexShaderCode = await loadShader('./src/shaders/vert.wgsl');
const fragmentShaderCode = await loadShader('./src/shaders/frag.wgsl');
engine.initPipeline(vertexShaderCode, fragmentShaderCode);


// Set camera position and orientation
const cameraPosition = [0, 0, 20]; // Position the camera 5 units away from the origin along the z-axis
const lookAtPoint = [0, 0, 0]; // Look at the origin
const upVector = [0, 1, 0]; // Define the up direction
camera.viewMatrix = mat4.lookAt(mat4.create(), cameraPosition, lookAtPoint, upVector);

// Create a new scene
const scene = new Scene(engine);

// Create geometries and add them to the scene
const mesh = new Sphere(0.5, 32, 32);
const sphere = scene.createSceneObject(mesh);
scene.translateSceneObject(sphere, [0, 0, 0]);

// Render
function render() {
    scene.render(camera);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
window.addEventListener('resize', resizeCanvas);