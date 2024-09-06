import { mat4 } from 'gl-matrix';

export class Engine {
    constructor(canvas) {
        // Needed objects
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.canvasFormat = null;

        // Rendering objects
        this.pipeline = null;
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.modelMatrix = mat4.create();
        this.uniformBuffer = null;
        this.uniformBindGroup = null;
        this.uniformBindGroupLayout = null;

        // Flags
        this.isInitialized = false;
        
        // Configuration
        this.backgroundColor = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };
        
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

        // Create uniform buffer
        // Assuming you have a maximum of 100 objects
        const maxObjects = 200;
        this.uniformBuffer = this.device.createBuffer({
            size: (2 * 4 * 4 * 4) + (maxObjects * 4 * 4 * 4), // Projection + View + some number of model matrices
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // create uniform bind group layout
        this.uniformBindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform'
                }
            }]
        });

        // Create uniform bind group
        this.uniformBindGroup = this.device.createBindGroup({
            layout: this.uniformBindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer
                }
            }]
        });

        // Create pipeline layout
        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.uniformBindGroupLayout]
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


        this.pipeline = this.device.createRenderPipeline({
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

    updateUniforms() {
        const uniformData = new Float32Array(3 * 4 * 4);
        uniformData.set(this.projectionMatrix, 0);
        uniformData.set(this.viewMatrix, 4 * 4);
        uniformData.set(this.modelMatrix, 8 * 4);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);
    }

    createPerspectiveMatrix(fov, aspect, near, far) {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fov, aspect, near, far);
        return projectionMatrix;
    }

    createViewMatrix(eye, center, up) {
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, eye, center, up);
        return viewMatrix;
    }

    createModelMatrix(translation, rotation, scale) {
        const translationMatrix = mat4.fromTranslation(mat4.create(), translation);
        const rotationMatrix = mat4.fromRotation(mat4.create(), rotation);
        const scaleMatrix = mat4.fromScaling(mat4.create(), scale);

        modelMatrix = mat4.create();
        mat4.mul(this.modelMatrix, this.modelMatrix, translationMatrix);
        mat4.mul(this.modelMatrix, this.modelMatrix, rotationMatrix);
        mat4.mul(this.modelMatrix, this.modelMatrix, scaleMatrix);

        return modelMatrix;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context.configure({
            device: this.device,
            format: this.canvasFormat,
            size: { width: this.canvas.width, height: this.canvas.height }
        });
        // Update projection matrix
        const aspectRatio = this.canvas.width / this.canvas.height;
        //mat4.perspective(this.projectionMatrix, Math.PI / 4, aspectRatio, 0.1, 100.0);
        this.perspectiveMatrix = this.createPerspectiveMatrix(Math.PI / 4, aspectRatio, 0.1, 100.0);
        this.updateUniforms();
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
        pass.setBindGroup(0, this.uniformBindGroup);
        return { encoder, pass };
    }

    endRenderPass(renderPass) {
        renderPass.pass.end();
        this.device.queue.submit([renderPass.encoder.finish()]);
    }
}