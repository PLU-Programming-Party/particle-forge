export class SceneObject {
    constructor(objectName, objectGeometry, objectMaterial, objectTransform, objectID) {
        this.objectName = objectName;
        this.objectGeometry = objectGeometry;
        this.objectMaterial = objectMaterial;
        this.objectTransform = objectTransform;
        this.objectID = objectID;
        this.children = [];
        this.parent = null;
    }

    setGeometry(geometry) {
        this.objectGeometry = geometry;
    }

    setMaterial(material) {
        this.objectMaterial = material; 
        this.children.push(child);
        child.parent = this;
    }

    update(deltaTime) {
        throw new Error('SceneObject error -> update function not implemented');
    }
}    

export class Scene {
    constructor(engine) {
        this.engine = engine;
        this.objects = [];
    }

    addObject(newSceneObject) {
        this.objects.push(newSceneObject);
    }

    async initialize() {
        for (let object of this.objects) {
            await object.initialize(this.engine);
        }
    }

    update(deltaTime) {
        for (let object of this.objects) {
            object.update(deltaTime);
        }
    }

    render() {
        for (let object of this.objects) {
            object.render();
        }
    }
}