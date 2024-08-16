export class SceneManager {
    constructor() {
        this.geometries = [];
    }

    addGeometry(geometry) {
        this.geometries.push(geometry);
    }

    draw(device, pass) {
        for (const geometry of this.geometries) {
            // Create a vertex buffer
            const vertexBuffer = device.createBuffer({
                size: geometry.vertices.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });

            const indexBuffer = device.createBuffer({
                size: geometry.indices.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            });
        }
    }
}