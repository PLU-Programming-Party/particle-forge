import * as THREE from 'three';

class Sphere {
    static sphereCount = 0; // Static variable to track the count of spheres

    constructor(color, size) {
        this.color = color;
        this.size = size;
        this.id = Sphere.sphereCount++; // Assign a unique ID to each sphere object
        this.geometry = new THREE.SphereGeometry(size, 32, 32);
        this.material = new THREE.PointsMaterial({
            color: color,
            size: 0.1
        });
        this.sphereObject = new THREE.Points(this.geometry, this.material);

        this.sphereObject.userData.id = this.id;
    }

    setPosition(x, y, z) {
        this.sphereObject.position.set(x, y, z);
    }

    getSphereObject() {
        return this.sphereObject;
    }

    getID() {
        return this.id;
    }
}

export default Sphere;
