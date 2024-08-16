import { SceneManager } from "./scene";
export { SceneManager };

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.canvasFormat = null;
        this.backgroundColor = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };
        this.isInitialized = false;
    }

    async initialize() {
        if(!navigator.gpu) {
            throw new Error('WebGPU is not supported');
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('No adapter found');
        }

        this.device = await adapter.requestDevice();
        this.context = this.canvas.getContext('webgpu');
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: this.canvasFormat
        });

        this.isInitialized = true;

        return this;
    }

    checkIfInitialized() {
        if (!this.isInitialized) {
            throw new Error('Engine ERROR -> Engine is not initialized');
        }
    }

    initPipeline(vertexShaderCode, fragmentShaderCode) {
        if (!this.isInitialized) {
            throw new Error('Engine.CreatePipeline ERROR -> Engine is not initialized');
        }
        const vertexShaderModule = this.device.createShaderModule({ code: vertexShaderCode });
        const fragmentShaderModule = this.device.createShaderModule({ code: fragmentShaderCode });

        // Create pipeline layout
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: []
        });


        this.pipeline = this.device.createRenderPipeline({
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
                    format: this.canvasFormat
                }]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });

        return this;
    }

    createBuffer(data, usage) {
        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: usage
        });

        this.device.queue.writeBuffer(buffer, 0, data);

        return buffer;
    }

    bufferGeometry(geometry) {
        const vertexBuffer = this.createBuffer(geometry.vertices, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
        const indexBuffer = this.createBuffer(geometry.indices, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);

        return { vertexBuffer, indexBuffer };
    }

    startRenderPass() {
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    loadOp: 'clear',
                    clearValue: this.backgroundColor,
                    storeOp: 'store',
                }]
        });
        pass.setPipeline(this.pipeline);
        return { encoder, pass };
    }

    endRenderPass(renderPass) {
        renderPass.pass.end();
        this.device.queue.submit([renderPass.encoder.finish()]);
    }
}