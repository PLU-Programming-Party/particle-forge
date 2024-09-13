struct Uniforms {
    projectionMatrix : mat4x4<f32>,
    viewMatrix : mat4x4<f32>,
    modelMatrices : array<mat4x4<f32>, 200>,
}; 

struct ParticleState {
    position : vec3<f32>,
    velocity : vec3<f32>,
    acceleration : vec3<f32>,
    rotation : vec4<f32>,
    color : vec4<f32>,
    mass : f32,
    size : f32,
    particle_class : u32,
    age : f32,
    lifetime : f32,
};

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(2) var<storage> particleStateBuffer: array<ParticleState, 200>;

struct VertexInput {
    @location(0) position : vec3<f32>,
    @builtin(instance_index) instanceID: u32,
}; 

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
}; 

@vertex
fn main(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    let modelMatrix = uniforms.modelMatrices[input.instanceID];
    let modelViewProjection = uniforms.projectionMatrix * uniforms.viewMatrix * modelMatrix;
    output.position = modelViewProjection * vec4<f32>(input.position, 1.0);
    return output;
}