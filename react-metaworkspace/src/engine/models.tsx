import { IModel } from "./types";
import { Renderer } from "./renderer"
import * as THREE from "three";
import { Decoder } from "./decoder";


export abstract class Model {
    renderer: Renderer;
    mesh: THREE.Mesh | THREE.LineSegments | undefined;
    pickingMesh: THREE.Mesh | THREE.LineSegments | undefined;
    removed: boolean;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.removed = false;
    }

    abstract remove(): void;

    removeFrom(mesh: THREE.Mesh | THREE.LineSegments | undefined, scene: THREE.Scene) {
        if (mesh) {
            this.renderer.scene.remove(mesh);
            mesh.geometry.dispose();
        }
        return undefined;
    }
}


export class PolygonalModel extends Model {
    constructor(data: IModel, renderer: Renderer) {
        super(renderer);

        Decoder.base64tofloat32(data.vertices, (vertices: Float32Array) => {
            if (this.removed)
                return;

            Decoder.base64toint32(data.attributes.oid.data, (objectid: Uint8Array) => {
                if (this.removed)
                    return;

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                geometry.setAttribute('objectID', new THREE.BufferAttribute(objectid, 4, true));
                geometry.computeVertexNormals();

                //normal mesh
                const mesh = new THREE.Mesh(geometry, this.renderer.material);
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                this.renderer.scene.add(mesh);
                this.mesh = mesh;

                //picking mesh
                const pickingMesh = new THREE.Mesh(geometry, this.renderer.pickingMaterial);
                this.renderer.pickingScene.add(pickingMesh);
                this.pickingMesh = pickingMesh;

                this.renderer.changed = true;

                if (this.removed)
                    this.remove();
            });
        });
    }

    remove() {
        this.mesh = this.removeFrom(this.mesh, this.renderer.scene);
        this.pickingMesh = this.removeFrom(this.pickingMesh, this.renderer.pickingScene);
        this.removed = true;
    }
}

export class LineModel extends Model {

    capLeft(resolution: number) {
        let vertices = [];
        const shift = Math.PI / 2;
        const step = Math.PI / resolution;

        for(let i = 0; i < resolution; ++i)
        {
            vertices.push(0, 0, 0);
            vertices.push(Math.cos(shift + step * i),       Math.sin(shift + step * i),       0);
            vertices.push(Math.cos(shift + step * (i + 1)), Math.sin(shift + step * (i + 1)), 0);

        }

        return vertices
    }

    capRight(resolution: number) {
        let vertices = [];
        const shift = Math.PI / 2;
        const step = Math.PI / resolution;

        for(let i = 0; i < resolution; ++i)
        {
            vertices.push(1, 0, 0);
            vertices.push(1 - Math.cos(shift + step * i),       Math.sin(shift + step * i),       0);
            vertices.push(1 - Math.cos(shift + step * (i + 1)), Math.sin(shift + step * (i + 1)), 0);
        }

        return vertices;
    }

    constructor(data: IModel, renderer: Renderer) {
        super(renderer);

        Decoder.base64tofloat32(data.vertices, (vertices: Float32Array) => {
            if (this.removed)
                return;

            Decoder.base64toint32(data.attributes.oid.data, (objectid: Uint8Array) => {
                if (this.removed)
                    return;

                //const lines = new Float32Array(vertices.length);
                //for(let i = 0; i < lines.length; i += 3){
                //    lines[i + 2] = 10;
                //}
                        
                const geometry = new THREE.InstancedBufferGeometry();
                geometry.instanceCount = vertices.length / 3;

                let segment = [
                    0, -1, 0,
                    1, -1, 0,
                    1,  1, 0,
                    0, -1, 0,
                    1,  1, 0,
                    0,  1, 0
                ];
                segment = segment.concat(this.capLeft(5));
                segment = segment.concat(this.capRight(5));

                console.log(segment);

                geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segment), 3));
                geometry.setAttribute('lineStart', new THREE.InterleavedBufferAttribute(
                    new THREE.InstancedInterleavedBuffer(vertices, //array
                        6, //stride
                        1), //mesh per attribute
                    3, //itemsize
                    0)); //offset

                geometry.setAttribute('lineEnd', new THREE.InterleavedBufferAttribute(
                    new THREE.InstancedInterleavedBuffer(vertices, //array
                        6, //stride
                        1), //mesh per attribute
                    3, //itemsize
                    3)); //offset

                //geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(
                //    objectid,
                //    4, //itemsize
                //    true, //normalized
                //    1)  //mesh per attribute
                //);

                //geometry.computeVertexNormals();

                //normal mesh
                const mesh = new THREE.Mesh(geometry, this.renderer.lineMaterial);
                mesh.frustumCulled = false;
                this.renderer.scene.add(mesh);
                this.mesh = mesh;
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

    remove() {
        this.mesh = this.removeFrom(this.mesh, this.renderer.scene);
        this.pickingMesh = this.removeFrom(this.pickingMesh, this.renderer.pickingScene);
        this.removed = true;
    }
}