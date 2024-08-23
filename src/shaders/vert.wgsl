struct Uniforms {
    projectionMatrix : mat4x4<f32>,
    viewMatrix : mat4x4<f32>,
    modelMatrix : mat4x4<f32>,
}; // Ensure this closing brace is correctly placed

@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexInput {
    @location(0) position : vec3<f32>,
}; // Ensure this closing brace is correctly placed

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
}; // Ensure this closing brace is correctly placed

@vertex
fn main(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;
    let modelViewProjection = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix;
    output.position = modelViewProjection * vec4<f32>(input.position, 1.0);
    return output;
}