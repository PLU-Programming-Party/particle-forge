import { loadShader } from './src/utility/shaderLoader';
import { Sphere, Cube, Plane, Cylinder, Cone } from './src/geometry/simple-geometry';
import { Engine } from './src/engine/engine';
import { Camera } from './src/engine/camera';
import { mat4 } from 'gl-matrix'; // Ensure you have gl-matrix installed

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

// Create buffers for sphere
const sphere = Sphere(0.5, 32, 32);
const sphereBuffers = engine.bufferGeometry(sphere);

// Create buffers for cube
const cube = Cube(1);
const cubeBuffers = engine.bufferGeometry(cube);

// Set camera position and orientation
const cameraPosition = [0, 0, 5]; // Position the camera 5 units away from the origin along the z-axis
const lookAtPoint = [0, 0, 0]; // Look at the origin
const upVector = [0, 1, 0]; // Define the up direction
camera.viewMatrix = mat4.lookAt(mat4.create(), cameraPosition, lookAtPoint, upVector);

// Render
function render() {
    const renderPass = engine.startRenderPass();

    // Set camera matrices
    const projectionMatrix = camera.projectionMatrix;
    const viewMatrix = camera.viewMatrix;

    // Define model matrices for each object
    const modelMatrixCube = mat4.create();
    mat4.translate(modelMatrixCube, modelMatrixCube, [-1.5, 0, 0]); // Move the cube to the left

    const modelMatrixSphere = mat4.create();
    mat4.translate(modelMatrixSphere, modelMatrixSphere, [1.5, 0, 0]); // Move the sphere to the right

    // Update the uniform buffer with the projection and view matrices
    engine.device.queue.writeBuffer(
        engine.uniformBuffer,
        0,
        projectionMatrix.buffer,
        projectionMatrix.byteOffset,
        projectionMatrix.byteLength
    );
    engine.device.queue.writeBuffer(
        engine.uniformBuffer,
        64, // Assuming 64 bytes offset for the view matrix
        viewMatrix.buffer,
        viewMatrix.byteOffset,
        viewMatrix.byteLength
    );

    // Render the cube
    engine.device.queue.writeBuffer(
        engine.uniformBuffer,
        128, // Assuming 128 bytes offset for the model matrix
        modelMatrixCube.buffer,
        modelMatrixCube.byteOffset,
        modelMatrixCube.byteLength
    );
    renderPass.pass.setBindGroup(0, engine.uniformBindGroup);
    renderPass.pass.setVertexBuffer(0, cubeBuffers.vertexBuffer);
    renderPass.pass.setIndexBuffer(cubeBuffers.indexBuffer, 'uint16');
    renderPass.pass.drawIndexed(cube.indices.length, 1, 0, 0, 0);

    // Render the sphere
    engine.device.queue.writeBuffer(
        engine.uniformBuffer,
        128, // Assuming 128 bytes offset for the model matrix
        modelMatrixSphere.buffer,
        modelMatrixSphere.byteOffset,
        modelMatrixSphere.byteLength
    );
    renderPass.pass.setBindGroup(0, engine.uniformBindGroup);
    renderPass.pass.setVertexBuffer(0, sphereBuffers.vertexBuffer);
    renderPass.pass.setIndexBuffer(sphereBuffers.indexBuffer, 'uint16');
    renderPass.pass.drawIndexed(sphere.indices.length, 1, 0, 0, 0);

    engine.endRenderPass(renderPass);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

resizeCanvas();
window.addEventListener('resize', resizeCanvas);