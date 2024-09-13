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

struct EnvironmentState {
    gravity : vec3<f32>,
    wind : vec3<f32>,
    num_repulsors : u32,
    max_repulsors : u32,
    repulsors : array<vec3<f32>, 10>,
    repulsor_strengths : array<f32, 10>,
    num_attractors : u32,
    max_attractors : u32,
    attractors : array<vec3<f32>, 10>,
    attractor_strengths : array<f32, 10>,
    upper_bound : vec3<f32>,
    lower_bound : vec3<f32>,
};

@group(0) @binding(1) var<storage, read_write> particleStateBufferOut: array<ParticleState, 200>;
@group(0) @binding(2) var<storage> particleStateBufferIn: array<ParticleState, 200>;

@compute @workgroup_size(1, 1)  // 1D workgroup size
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let index = global_id.x;
    if(index < 200u) {
        particleStateBufferOut[index] = particleStateBufferIn[index];
    }
}