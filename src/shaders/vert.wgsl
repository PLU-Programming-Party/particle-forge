struct Uniforms {
    projectionMatrix : mat4x4<f32>,
    viewMatrix : mat4x4<f32>,
    modelMatrices : array<mat4x4<f32>, 100>,
}; 

@group(0) @binding(0) var<uniform> uniforms : Uniforms;

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