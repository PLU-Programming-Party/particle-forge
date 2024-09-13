import { mat4 } from 'gl-matrix';
import { Particle, ParticleEnvironment } from '../forge/particle-system';

export class Engine {
    constructor(canvas) {
        // Needed objects
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.canvasFormat = null;

        // Rendering objects
        this.renderPipeline = null;
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.modelMatrix = mat4.create();
        this.uniformBuffer = null;
        this.uniformBindGroups = null;
        this.uniformBindGroupLayout = null;

        // Flags
        this.isInitialized = false;
        
        // Configuration
        this.backgroundColor = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };

        // Particle system
        this.particleStateBuffers = null;
        this.environmentBuffer = null;
        this.computePipeline = null;

        // Step counter
        this.step = 0;
        
    }

    async initialize() {
        // Check if WebGPU is supported
        if(!navigator.gpu) {
            throw new Error('WebGPU is not supported');
        }

        // Request an adapter
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('No adapter found');
        }

        // Request a device
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
            this.initialize();
        }
    }

    initPipeline(vertexShaderCode, fragmentShaderCode, computeShaderCode) {
        // Safety check
        this.checkIfInitialized();

        // Create shader modules
        const vertexShaderModule = this.device.createShaderModule({ code: vertexShaderCode });
        const fragmentShaderModule = this.device.createShaderModule({ code: fragmentShaderCode });
        const computeShaderModule = this.device.createShaderModule({ code: computeShaderCode });

        // Set the maximum number of objects
        const maxObjects = 200;

        // Create storage buffer for particle state
        let particleBufferSize = Math.ceil(Object.values(Particle).reduce((size, array) => size + array.byteLength, 0) / 256) * 256; // Align to 256 bytes
        let environmentBufferSize = Math.ceil(Object.values(ParticleEnvironment).reduce((size, array) => size + array.byteLength, 0) / 256) * 256; // Align to 256 bytes

        this.particleStateBuffers = [
            this.device.createBuffer({
                label: 'Particle State Buffer A',
                size: maxObjects * particleBufferSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX
            }),
            this.device.createBuffer({
                label: 'Particle State Buffer B',
                size: maxObjects * particleBufferSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX
            })
        ]

        this.environmentBuffer = this.device.createBuffer({
            size: environmentBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX
        });

        // Create uniform buffer
        this.uniformBuffer = this.device.createBuffer({
            size: (2 * 4 * 4 * 4) + (maxObjects * 4 * 4 * 4), // Projection + View + some number of model matrices
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // create bind group layout
        this.uniformBindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0, // Uniform buffer
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform'
                }
            },
            {
                binding: 1, // Particle state input buffer
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: 'storage'
                }
            },
            {
                binding: 2, // Particle state output buffer
                visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX,
                buffer: {
                    type: 'read-only-storage'
                }
            },
            {
                binding: 3,
                visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX,
                buffer: {
                    type: 'read-only-storage'
                }
            }]
        });

        // Create uniform bind group
        this.uniformBindGroups = [this.device.createBindGroup({
            layout: this.uniformBindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: this.particleStateBuffers[0]
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: this.particleStateBuffers[1]
                }
            },
            {
                binding: 3,
                resource: {
                    buffer: this.environmentBuffer
                }
            }]
        }),
        this.device.createBindGroup({
            layout: this.uniformBindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: this.particleStateBuffers[1]
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: this.particleStateBuffers[0]
                }
            },
            {
                binding: 3,
                resource: {
                    buffer: this.environmentBuffer
                }
            }]
        })];

        // Create pipeline layout
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.uniformBindGroupLayout]
        });

        // Create particle system compute pipeline
        this.computePipeline = this.device.createComputePipeline({
            label: 'Particle System Compute Pipeline',
            layout: pipelineLayout,
            compute: {
                module: computeShaderModule,
                entryPoint: 'main'
            }
        });

        // Create vertex buffer layout
        const vertexBufferLayout = {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [{
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3'
            }]
        };


        this.renderPipeline = this.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: vertexShaderModule,
                entryPoint: 'main',
                buffers: [vertexBufferLayout]
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

        const computePass = encoder.beginComputePass();

        computePass.setPipeline(this.computePipeline);
        computePass.setBindGroup(0, this.uniformBindGroups[this.step % 2]);
        const workgroupCount = Math.ceil(200 / 64);
        computePass.dispatchWorkgroups(workgroupCount, workgroupCount);
        computePass.end();

        this.step++;

        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    loadOp: 'clear',
                    clearValue: this.backgroundColor,
                    storeOp: 'store',
                }]
        });
        pass.setPipeline(this.renderPipeline);
        pass.setBindGroup(0, this.uniformBindGroups[this.step % 2]);
        return { encoder, pass };
    }

    endRenderPass(renderPass) {
        renderPass.pass.end();
        this.device.queue.submit([renderPass.encoder.finish()]);
    }
}