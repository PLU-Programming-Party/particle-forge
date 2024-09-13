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
    scale : vec3<f32>,
    color : vec4<f32>,
    mass : f32,
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

fn create_rotation_matrix(q: vec4<f32>) -> mat4x4<f32> {
    let xx = q.x * q.x;
    let yy = q.y * q.y;
    let zz = q.z * q.z;
    let xy = q.x * q.y;
    let xz = q.x * q.z;
    let yz = q.y * q.z;
    let wx = q.w * q.x;
    let wy = q.w * q.y;
    let wz = q.w * q.z;

    return mat4x4<f32>(
        vec4<f32>(1.0 - 2.0 * (yy + zz), 2.0 * (xy + wz), 2.0 * (xz - wy), 0.0),
        vec4<f32>(2.0 * (xy - wz), 1.0 - 2.0 * (xx + zz), 2.0 * (yz + wx), 0.0),
        vec4<f32>(2.0 * (xz + wy), 2.0 * (yz - wx), 1.0 - 2.0 * (xx + yy), 0.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );
}

fn create_scale_matrix(scale: vec3<f32>) -> mat4x4<f32> {
    return mat4x4<f32>(
        vec4<f32>(scale.x, 0.0, 0.0, 0.0),
        vec4<f32>(0.0, scale.y, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, scale.z, 0.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );
}

fn create_translation_matrix(translation: vec3<f32>) -> mat4x4<f32> {
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0),
        vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, 1.0, 0.0),
        vec4<f32>(translation, 1.0)
    );
}

@vertex
fn main(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;

    // let particle = particleStateBuffer[input.instanceID];
    
    // let scaleMatrix = create_scale_matrix(particle.scale);
    // let rotationMatrix = create_rotation_matrix(particle.rotation);
    // let translationMatrix = create_translation_matrix(particle.position);

    // let modelMatrix = translationMatrix * rotationMatrix * scaleMatrix;

    let modelMatrix = uniforms.modelMatrices[input.instanceID];

    let modelViewProjection = uniforms.projectionMatrix * uniforms.viewMatrix * modelMatrix;
    output.position = modelViewProjection * vec4<f32>(input.position, 1.0);
    return output;
}