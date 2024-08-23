import { loadShader } from './src/utility/shaderLoader';
import { Sphere, Cube, Plane, Cylinder, Cone } from './src/geometry/simple-geometry';
import { Engine } from './src/engine/engine';

// Create a canvas
const canvas = document.querySelector('canvas');

// Create an engine
const engine = new Engine(canvas);

// Initialize the engine
await engine.initialize();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine.context.configure({
        device: engine.device,
        format: engine.canvasFormat,
        size: { width: canvas.width, height: canvas.height }
    });
    render();
}

const vertexShaderCode = await loadShader('./src/shaders/vert.wgsl');
const fragmentShaderCode = await loadShader('./src/shaders/frag.wgsl');
engine.initPipeline(vertexShaderCode, fragmentShaderCode);

//Create buffers for sphere
const sphere = Sphere(0.5, 32, 32);
const sphereBuffers = engine.bufferGeometry(sphere);

//Create buffers for cube
const cube = Cube(1);
const cubeBuffers = engine.bufferGeometry(cube);

// Render
function render() {
    const renderPass = engine.startRenderPass();

    renderPass.pass.setVertexBuffer(0, cubeBuffers.vertexBuffer);
    renderPass.pass.setIndexBuffer(cubeBuffers.indexBuffer, 'uint16');
    renderPass.pass.drawIndexed(cube.indices.length, 1, 0, 0, 0);

    renderPass.pass.setVertexBuffer(0, sphereBuffers.vertexBuffer);
    renderPass.pass.setIndexBuffer(sphereBuffers.indexBuffer, 'uint16');
    renderPass.pass.drawIndexed(sphere.indices.length, 1, 0, 0, 0);

    engine.endRenderPass(renderPass);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);