const maxRepulsors = 10;
const maxAttractors = 10;

// Create a struct for the particle state
const Particle = {
    position: new Float32Array(3),
    velocity: new Float32Array(3),
    acceleration: new Float32Array(3),
    rotation: new Float32Array(4),
    scale: new Float32Array(3),
    color: new Float32Array(4),
    mass: new Float32Array(1),
    particle_class: new Float32Array(1),
    age: new Float32Array(1),
    maxLifetime: new Float32Array(1)
}

// Create a struct for the environment state
const ParticleEnvironment = {
    gravity: new Float32Array(3),
    wind: new Float32Array(3),
    numRepulsors: new Float32Array(1),
    maxRepulsors: new Float32Array(1),
    repulsors: new Float32Array(maxRepulsors * 3),
    repulsorStrengths: new Float32Array(maxRepulsors),
    numAttractors: new Float32Array(1),
    maxAttractors: new Float32Array(1),
    attractors: new Float32Array(maxAttractors * 3),
    attractorStrengths: new Float32Array(maxAttractors),
    volumeUpperBounds: new Float32Array(3),
    volumeLowerBounds: new Float32Array(3)
}

function serializeArrayOfStructs(arrayOfStructs, structTemplate) {
    const structSize = Object.values(structTemplate).reduce((size, array) => size + array.byteLength, 0);
    const serialized = new Float32Array(arrayOfStructs.length * structSize / Float32Array.BYTES_PER_ELEMENT);

    let index = 0;
    for (let i = 0; i < arrayOfStructs.length; i++) {
        for (const key in structTemplate) {
            serialized.set(arrayOfStructs[i][key], index);
            index += structTemplate[key].length;
        }
    }
    return serialized;
}

export { Particle, ParticleEnvironment, serializeArrayOfStructs };