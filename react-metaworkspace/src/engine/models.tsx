import { ILayer, IModel, IOverlay } from "./types";
import { Renderer } from "./renderer"
import * as THREE from "three";
import { Decoder } from "./decoder";
import { segment } from "./geometry";


export abstract class Model {
    renderer: Renderer;
    mesh: THREE.Mesh | undefined;
    pickingMesh: THREE.Mesh | undefined;

    removed: boolean;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.removed = false;
    }

    remove() {
        this.mesh = this.removeFrom(this.mesh, this.renderer.scene);
        this.pickingMesh = this.removeFrom(this.pickingMesh, this.renderer.pickingScene);
        this.removed = true;
    }

    removeFrom(mesh: THREE.Mesh | THREE.LineSegments | undefined, scene: THREE.Scene) {
        if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
        }
        return undefined;
    }
}


export class PolygonalModel extends Model {
    constructor(data: IModel, renderer: Renderer, layer: ILayer, pickable: boolean = true) {
        super(renderer);
        const offset = renderer.picker.offsetForLayer(layer.name);

        Decoder.base64tofloat32(data.vertices, this, (vertices: Float32Array) => {
            if (this.removed)
                return;

            if (pickable)
            {
                Decoder.base64toint32(data.attributes.oid.data, offset, this, (objectid: Uint8Array) => {
                    if (this.removed)
                        return;
    
                    const geometry = this.createGeometry(vertices, objectid);
                    this.createMesh(geometry, pickable);
                    this.createPickingMesh(geometry);
                    this.renderer.changed = true;
    
                    if (this.removed)
                        this.remove();
                });
            } else {
                const geometry = this.createGeometry(vertices);
                this.createMesh(geometry, pickable);
                this.renderer.changed = true;

                if (this.removed)
                    this.remove();
            }
        });
    }

    private createPickingMesh(geometry: THREE.BufferGeometry) {
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingMaterial);
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.BufferGeometry, pickable: boolean) {
        const material = pickable? this.renderer.matlib.polygonSelectMaterial : this.renderer.matlib.polygonMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectid: Uint8Array | undefined = undefined) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        if (objectid)
            geometry.setAttribute('objectID', new THREE.BufferAttribute(objectid, 4, true));
        geometry.computeVertexNormals();
        return geometry;
    }

    
}

export class LineModel extends Model {
    constructor(data: IModel, renderer: Renderer, layer: ILayer) {
        super(renderer);
        const offset = renderer.picker.offsetForLayer(layer.name);

        Decoder.base64tofloat32(data.vertices, this, (vertices: Float32Array) => {
            if (this.removed)
                return;

            Decoder.base64toint32(data.attributes.oid.data, offset, this, (objectid: Uint8Array) => {
                if (this.removed)
                    return;

                const geometry = this.createGeometry(vertices); //offset
                this.createMesh(geometry);

                //geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(
                //    objectid,
                //    4, //itemsize
                //    true, //normalized
                //    1)  //mesh per attribute
                //);

                //geometry.computeVertexNormals();

                //normal mesh
                //console.log(this.mesh);

                this.renderer.changed = true;

                //picking mesh
                //const pickingMesh = new THREE.Mesh( geometry, this.renderer.pickingMaterial ); //TODO change to normal material
                //this.renderer.pickingScene.add(pickingMesh);
                //this.renderer.changed = true;
                //this.mesh = mesh;

                if (this.removed)
                    this.remove();

            });
        });
    }

    private createMesh(geometry: THREE.InstancedBufferGeometry) {
        const mesh = new THREE.Mesh(geometry, this.renderer.matlib.lineMaterial);
        mesh.frustumCulled = false; //this one was a big pain to figure out...
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = vertices.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segment()), 3));
        geometry.setAttribute('lineStart', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 0));

        geometry.setAttribute('lineEnd', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 3));

        return geometry;
    }
}

export class LineProxyModel extends Model {
    constructor(data: IModel, renderer: Renderer, overlay: IOverlay) {
        super(renderer);
        const offset = renderer.picker.offsetForLayer(overlay.source);

        Decoder.base64tofloat32(data.vertices, this, (vertices: Float32Array) => {
            if (this.removed)
                return;

            

            Decoder.base64toint32(data.attributes.oid.data, offset, this, (objectid: Uint8Array) => {
                if (this.removed)
                    return;

                const geometry = this.createGeometry(vertices); //offset
                this.createMesh(geometry);

                //geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(
                //    objectid,
                //    4, //itemsize
                //    true, //normalized
                //    1)  //mesh per attribute
                //);

                //geometry.computeVertexNormals();

                //normal mesh
                //console.log(this.mesh);

                this.renderer.changed = true;

                //picking mesh
                //const pickingMesh = new THREE.Mesh( geometry, this.renderer.pickingMaterial ); //TODO change to normal material
                //this.renderer.pickingScene.add(pickingMesh);
                //this.renderer.changed = true;
                //this.mesh = mesh;

                if (this.removed)
                    this.remove();

            });
        });
    }

    private createMesh(geometry: THREE.InstancedBufferGeometry) {
        const mesh = new THREE.Mesh(geometry, this.renderer.matlib.lineMaterial);
        mesh.frustumCulled = false; //this one was a big pain to figure out...
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = vertices.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segment()), 3));
        geometry.setAttribute('lineStart', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 0));

        geometry.setAttribute('lineEnd', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 3));

        return geometry;
    }
}
