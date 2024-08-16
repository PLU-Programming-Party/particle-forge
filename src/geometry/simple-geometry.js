export function Sphere(radius, latitudeBands, longitudeBands) {
    const vertices = [];
    const indices = [];

    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            vertices.push(radius * x);
            vertices.push(radius * y);
            vertices.push(radius * z);
        }
    }

    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
        for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
}

export function Cube(size) {
    const halfSize = size / 2;
    const vertices = new Float32Array([
        // Front face
        -halfSize, -halfSize,  halfSize,
         halfSize, -halfSize,  halfSize,
         halfSize,  halfSize,  halfSize,
        -halfSize,  halfSize,  halfSize,
        // Back face
        -halfSize, -halfSize, -halfSize,
        -halfSize,  halfSize, -halfSize,
         halfSize,  halfSize, -halfSize,
         halfSize, -halfSize, -halfSize,
    ]);

    const indices = new Uint16Array([
        // Front face
        0, 1, 2,  0, 2, 3,
        // Back face
        4, 5, 6,  4, 6, 7,
        // Top face
        3, 2, 6,  3, 6, 5,
        // Bottom face
        0, 1, 7,  0, 7, 4,
        // Right face
        1, 2, 6,  1, 6, 7,
        // Left face
        0, 3, 5,  0, 5, 4,
    ]);

    return {
        vertices,
        indices
    };
}

export function Plane(width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const vertices = new Float32Array([
        -halfWidth, -halfHeight, 0,
         halfWidth, -halfHeight, 0,
         halfWidth,  halfHeight, 0,
        -halfWidth,  halfHeight, 0,
    ]);

    const indices = new Uint16Array([
        0, 1, 2,  0, 2, 3,
    ]);

    return {
        vertices,
        indices
    };
}

export function Cylinder(radius, height, radialSegments, heightSegments) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= radialSegments; ++i) {
        const theta = i * 2 * Math.PI / radialSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let j = 0; j <= heightSegments; ++j) {
            const y = height / 2 - j * height / heightSegments;
            const x = radius * cosTheta;
            const z = radius * sinTheta;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);
        }
    }

    for (let i = 0; i < radialSegments; ++i) {
        for (let j = 0; j < heightSegments; ++j) {
            const first = (i * (heightSegments + 1)) + j;
            const second = first + heightSegments + 1;

            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
}

export function Cone(radius, height, radialSegments, heightSegments) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= radialSegments; ++i) {
        const theta = i * 2 * Math.PI / radialSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let j = 0; j <= heightSegments; ++j) {
            const y = height / 2 - j * height / heightSegments;
            const x = radius * (1 - y / height) * cosTheta;
            const z = radius * (1 - y / height) * sinTheta;

            vertices.push(x);
            vertices.push(y);
            vertices.push(z);
        }
    }

    for (let i = 0; i < radialSegments; ++i) {
        for (let j = 0; j < heightSegments; ++j) {
            const first = (i * (heightSegments + 1)) + j;
            const second = first + heightSegments + 1;

            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices)
    };
}