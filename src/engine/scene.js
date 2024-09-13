import { mat4, vec3, quat } from 'gl-matrix';
import { Particle, ParticleEnvironment, serializeArrayOfStructs } from '../forge/particle-system';

class Scene {
    constructor(engine) {
        this.sceneObjects = [];
        this.particleStates = [];
        this.particleGeometries = [];
        this.particleEnvironment = {...ParticleEnvironment};
        this.engine = engine;
    }

    createParticle(geometry, particle_class, position=[0, 0, 0], velocity=[0, 0, 0], acceleration=[0, 0, 0], rotation=[0, 0, 0, 1], scale=[1, 1, 1], color=[1, 1, 1, 1], mass=1, maxLifetime=-1) {
        const particle = {...Particle};
        
        particle.position = new Float32Array(position);
        particle.velocity = new Float32Array(velocity);
        particle.acceleration = new Float32Array(acceleration);
        particle.rotation = new Float32Array(rotation);
        particle.scale = new Float32Array(scale);
        particle.color = new Float32Array(color);
        particle.mass = new Float32Array([mass]);
        particle.particle_class = new Float32Array([particle_class]);
        particle.age = new Float32Array([0]);
        particle.maxLifetime = new Float32Array([maxLifetime]);

        this.particleStates.push(particle);
        this.particleGeometries.push(geometry);

        const serializedParticles = serializeArrayOfStructs(this.particleStates, Particle);
        const serializedEnvironment = serializeArrayOfStructs([this.particleEnvironment], ParticleEnvironment);

        this.engine.device.queue.writeBuffer(
            this.engine.particleStateBuffers[this.engine.step % 2],
            0,
            serializedParticles.buffer,
            serializedParticles.byteOffset,
            serializedParticles.byteLength
        );

        this.engine.device.queue.writeBuffer(
            this.engine.environmentBuffer,
            0,
            serializedEnvironment.buffer,
            serializedEnvironment.byteOffset,
            serializedEnvironment.byteLength
        );
    }

    setEnvironmentBounds(lowerBounds, upperBounds) {
        this.particleEnvironment.volumeLowerBounds = new Float32Array(lowerBounds);
        this.particleEnvironment.volumeUpperBounds = new Float32Array(upperBounds);
    }

    setEnvironmentAttraction(attractors, attractorStrengths) {
        this.particleEnvironment.numAttractors = new Float32Array([attractors.length / 3]);
        this.particleEnvironment.attractors = new Float32Array(attractors);
        this.particleEnvironment.attractorStrengths = new Float32Array(attractorStrengths);
    }

    setEnvironmentRepulsion(repulsors, repulsorStrengths) {
        this.particleEnvironment.numRepulsors = new Float32Array([repulsors.length / 3]);
        this.particleEnvironment.repulsors = new Float32Array(repulsors);
        this.particleEnvironment.repulsorStrengths = new Float32Array(repulsorStrengths);
    }

    setEnvironmentGravity(gravity) {
        this.particleEnvironment.gravity = new Float32Array([gravity]);
    }

    createSceneObject(geometry, modelMatrix=null, parent=null) {
        let newModelMat = null;
        let newParent = null;
        let newChildren = [];

        if(parent) {
            newParent = parent;
        }

        if(modelMatrix) {
            newModelMat = modelMatrix;
        } else {
            newModelMat = mat4.create();
        }

        const newSceneObject = {
            geometry: geometry,
            modelMatrix: newModelMat,
            parent: newParent,
            children: newChildren
        };

        this.sceneObjects.push(newSceneObject);

        return this.sceneObjects.length - 1;
    }

    addChild(parentIndex, childIndex) {
        this.sceneObjects[parentIndex].children.push(childIndex);
        this.sceneObjects[childIndex].parent = parentIndex;
    }
    
    getParentObject(index) {
        if(this.sceneObjects[index].parent === null) {
            return null;
        }
        return this.sceneObjects[this.sceneObjects[index].parent];
    }

    getParentObjectID(index) {
        return this.sceneObjects[index].parent;
    }

    getChildObjectIDs(index) {
        return this.sceneObjects[index].children;
    }

    getSceneObject(index) {
        return this.sceneObjects[index];
    }

    getFullModelMatrix(index) {
        let modelMatrix = mat4.create();
        let currentObject = this.sceneObjects[index];

        while(currentObject) {
            mat4.multiply(modelMatrix, currentObject.modelMatrix, modelMatrix);
            if(currentObject.parent === null) {
                break;
            }
            currentObject = this.getParentObject(currentObject);
        }

        return modelMatrix;
    }

    updateModelMatrix(index, modelMatrix) {
        mat4.copy(this.sceneObjects[index].modelMatrix, modelMatrix);
    }

    // USER FACING FUNCTIONS
    translateSceneObject(index, translation) {
        mat4.translate(this.sceneObjects[index].modelMatrix, this.sceneObjects[index].modelMatrix, translation);
    }

    rotateSceneObject(index, rotation) {
        mat4.rotate(this.sceneObjects[index].modelMatrix, this.sceneObjects[index].modelMatrix, rotation, [0, 1, 0]);
    }

    scaleSceneObject(index, scale) {
        mat4.scale(this.sceneObjects[index].modelMatrix, this.sceneObjects[index].modelMatrix, scale);
    }
    // END USER FACING FUNCTIONS

    getObjectTranslationVector(index) {
        const translation = vec3.create();
        mat4.getTranslation(translation, this.sceneObjects[index].modelMatrix);
        return translation;
    }

    getObjectRotationVector(index) {
        const rotation = vec3.create();
        mat4.getRotation(rotation, this.sceneObjects[index].modelMatrix);
        return rotation;
    }

    getObjectScaleVector(index) {
        const scale = vec3.create();
        mat4.getScaling(scale, this.sceneObjects[index].modelMatrix);
        return scale;
    }

    setObjectXYZ(index, x, y, z) {
        const translation = vec3.fromValues(x, y, z);
        mat4.fromTranslation(this.sceneObjects[index].modelMatrix, translation);
    }

    setObjectRPY(index, roll, pitch, yaw) {
        const rotation = quat.create();
        quat.fromEuler(rotation, roll, pitch, yaw);
        mat4.fromQuat(this.sceneObjects[index].modelMatrix, rotation);
    }

    setObjectQuat(index, quaternion) {
        mat4.fromQuat(this.sceneObjects[index].modelMatrix, quaternion);
    }

    setObjectScale(index, x, y, z) {
        const scale = vec3.fromValues(x, y, z);
        mat4.fromScaling(this.sceneObjects[index].modelMatrix, scale);
    }

    render(camera) {
        // Safety checks
        if(!camera) {
            console.error('Camera is not defined');
            return;
        }

        if(!this.engine) {
            console.error('Engine is not defined');
            return;
        }

        const renderPass = this.engine.startRenderPass();

        // Get the projection and view matrices from the camera
        const projectionMatrix = camera.projectionMatrix;
        const viewMatrix = camera.viewMatrix;

        // Update the uniform buffer with the projection and view matrices
        this.engine.device.queue.writeBuffer(
            this.engine.uniformBuffer,
            0,
            projectionMatrix.buffer,
            projectionMatrix.byteOffset,
            projectionMatrix.byteLength
        );

        this.engine.device.queue.writeBuffer(
            this.engine.uniformBuffer,
            64, // Assuming 64 bytes offset for the view matrix
            viewMatrix.buffer,
            viewMatrix.byteOffset,
            viewMatrix.byteLength
        );

        this.sceneObjects.forEach((sceneObject, index) => {
            const offset = 128 + (index * 64);
            const fullModelMatrix = this.getFullModelMatrix(index);
            const geometryBuffers = this.engine.bufferGeometry(sceneObject.geometry);

            this.engine.device.queue.writeBuffer(
                this.engine.uniformBuffer,
                offset,
                fullModelMatrix.buffer,
                fullModelMatrix.byteOffset,
                fullModelMatrix.byteLength
            );

            renderPass.pass.setVertexBuffer(0, geometryBuffers.vertexBuffer);
            renderPass.pass.setIndexBuffer(geometryBuffers.indexBuffer, 'uint16');
            renderPass.pass.drawIndexed(sceneObject.geometry.indices.length, 1, 0, 0, index);
        });

        this.engine.endRenderPass(renderPass);
    }
}

export { Scene };