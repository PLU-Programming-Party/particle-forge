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

    setTransform(position, target, up) {
        this.position = position;
        this.target = target;
        this.up = up;
        this.updateViewMatrix();
    }

    translate(translation) {
        this.position = vec3.add(this.position, this.position, translation);
        this.updateViewMatrix();
    }

    rotate(rotation) {
        this.target = vec3.transformMat4(this.target, this.target, mat4.fromRotation(mat4.create(), rotation));
        this.up = vec3.transformMat4(this.up, this.up, mat4.fromRotation(mat4.create(), rotation));
        this.updateViewMatrix();
    }
}