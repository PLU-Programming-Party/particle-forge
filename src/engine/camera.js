import { mat4 } from 'gl-matrix';

export class Camera {
    constructor(fov, aspect, near, far) {
        this.position = [0, 0, 5];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.projectionMatrix = mat4.perspective(mat4.create(), fov, aspect, near, far);
        this.viewMatrix = mat4.lookAt(mat4.create(), this.position, this.target, this.up);
    }

    updateViewMatrix() {
        this.viewMatrix = mat4.lookAt(mat4.create(), this.position, this.target, this.up);
    }
}