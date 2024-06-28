class particle {
    constructor(color, size, pos_x, pos_y, pos_z, id) {
        this.color = color; this.size = size; this.id = id;
        this.pos_x = pos_x; this.pos_y = pos_y; this.pos_z = pos_z;
    }
    movement(direction) {
        let movementamount = 3;
        switch(direction) {
            case "right":
                this.pos_x += movementamount; break;
            case "left":
                this.pos_x -= movementamount; break;
            case "up":
                this.pos_y += movementamount; break;
            case "down":
                this.pos_y -= movementamount; break;
            case "back":
                this.pos_z -= movementamount; break;
            case "forward":
                this.pos_z += movementamount; break;
            default:
                break;
        }
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        let obj = scene.getObjectByName(toString(this.id)); 
        obj.position.set(this.pos_x, this.pos_y, this.pos_z); console.log(obj.position)
        obj.needsUpdate = true;
        console.log(spheres); 
    }
    updateParticle() {
        const [color, size, pos_x, pos_y, pos_z, id] = [this.color, this.size, this.pos_x, this.pos_y, this.pos_z, this.id];
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = toString(id);
        sphere.position.x = pos_x;
        sphere.position.y = pos_y;
        sphere.position.z = pos_z;
        scene.add(sphere);
        console.log(scene)
    }
}