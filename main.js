import { loadShader } from './src/utility/shaderLoader';
import { Sphere } from './src/geometry/simple-geometry';

// Check if WebGPU is supported
if (!navigator.gpu) {
    console.error('WebGPU is not supported');
} else {
    console.log('WebGPU is supported');
}

// Request adapter and device
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
    console.error('No adapter found');
}
const device = await adapter.requestDevice();

// Create a canvas and context
const canvas = document.querySelector('canvas');
const context = canvas.getContext('webgpu');
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device,
    format: canvasFormat
});

// Resize canvas function
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.configure({
        device,
        format: canvasFormat,
        size: { width: canvas.width, height: canvas.height }
    });
    render();
}

// load shaders
const vertexShaderCode = await loadShader('./src/shaders/vert.wgsl');
const fragmentShaderCode = await loadShader('./src/shaders/frag.wgsl');

const vertexShaderModule = device.createShaderModule({ code: vertexShaderCode });
const fragmentShaderModule = device.createShaderModule({ code: fragmentShaderCode });

// vertex data for a single triangle
const vertices = new Float32Array([
    0.0, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
]);

// create a vertex buffer
const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(vertexBuffer, 0, vertices);

// Create pipeline layout
const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: []
});

// Create pipeline
const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
        module: vertexShaderModule,
        entryPoint: 'main',
        buffers: [{
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [{
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3'
            }]
        }]
    },
    fragment: {
        module: fragmentShaderModule,
        entryPoint: 'main',
        targets: [{
            format: canvasFormat
        }]
    },
    primitive: {
        topology: 'triangle-list'
    }
})

// Render function
function render() {
    // Create a command encoder
    const encoder = device.createCommandEncoder();

    const pass = encoder.beginRenderPass({
        colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        storeOp: "store",
        }]
    });

    // Set the pipeline
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    pass.draw(3, 1, 0, 0);

    // Finish the pass
    pass.end();
    device.queue.submit([encoder.finish()]);
}

// Always fill the window with the canvas
resizeCanvas();
window.addEventListener('resize', resizeCanvas);