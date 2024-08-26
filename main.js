import { loadShader } from './src/utility/shaderLoader';
import { Sphere, Cube, Plane, Cylinder, Cone } from './src/geometry/simple-geometry';
import { Engine } from './src/engine/engine';
import { Camera } from './src/engine/camera';
import { mat4, vec3 } from 'gl-matrix'; // Ensure you have gl-matrix installed
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
const numberOfCubes = 100;
for (let i = 0; i < numberOfCubes; i++) {
    const mesh = new Cube(0.5, 0.5, 0.5);
    const cube = scene.createSceneObject(mesh);
    sceneObjects.push(cube);
    const randomX = Math.random() * 30 - 15;
    const randomY = Math.random() * 30 - 15;
    const randomZ = Math.random() * 30 - 15;
    scene.translateSceneObject(cube, [randomX, randomY, randomZ]);
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

let mousePosition = { x: 0, y: 0, u: 0, v: 0 };
window.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
    mousePosition.u = (mousePosition.x / canvas.width);
    mousePosition.v = (mousePosition.y / canvas.height);
    mousePosition.nx = mousePosition.u * 2 - 1;
    mousePosition.ny = -(mousePosition.v * 2 - 1);
});

function getWorldCoordinates(mousePosition, camera) {
    const ndc = vec3.fromValues(mousePosition.nx, mousePosition.ny, 1.0);
    const inverseProjectionView = mat4.invert(mat4.create(), camera.projectionMatrix);

    if (!inverseProjectionView) {
        console.error("Matrix inversion failed");
        return vec3.create(); // Return a zero vector to avoid NaNs
    }

    const worldCoordinates = vec3.transformMat4(vec3.create(), ndc, inverseProjectionView);
    return worldCoordinates;
}

/***************************************************************************************************************
 * MAIN RENDER LOOP
 ***************************************************************************************************************/
while (true) {
    // print the mouse position
    const worldCoordinates = getWorldCoordinates(mousePosition, camera);
    worldCoordinates[2] = 0; // set the z-coordinate to 0 to ensure the particles move in the xy-plane
    const particleSpeed = 0.03;

    for(let i = 0; i < sceneObjects.length; i++) {
        const sceneObject = sceneObjects[i];
        const objectPosition = scene.getObjectTranslationVector(sceneObject);
        const direction = vec3.subtract(vec3.create(), worldCoordinates, objectPosition);
        const directionUnitVector = vec3.normalize(vec3.create(), direction);
        
        const translation = vec3.scale(vec3.create(), directionUnitVector, particleSpeed);

        // Check for NaN values
        if (isNaN(translation[0]) || isNaN(translation[1]) || isNaN(translation[2])) {
            console.error("Translation resulted in NaN values", translation);
            continue;
        } else {
            scene.translateSceneObject(sceneObject, translation);
        }
        // scene.translateSceneObject(sceneObject, translation);
        // scene.translateSceneObject(sceneObject, [-0.01, -0.01, 0]);
        // const translation = vec3.scale(vec3.create(), normalizedDirection, particleSpeed);
        // scene.translateSceneObject(sceneObject, translation);
    }

    scene.render(camera);
    // delay for 1/60th of a second
    await new Promise(resolve => setTimeout(resolve, 1000 / 60));
}