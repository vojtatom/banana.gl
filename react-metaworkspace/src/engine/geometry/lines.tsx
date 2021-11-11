import { IModel } from "../types";
import * as THREE from "three";
import { Decoder } from "../utils/decoder";
import { segment } from "./geometry";
import { Tile } from "../datamodel/tile";
import { Model } from "./base";
import { Overlay } from "../datamodel/layer";


export class LineModel extends Model {
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);
        const offset = tile.renderer.picker.offsetForLayer(tile.layer.name);

        Decoder.base64tofloat32(data.vertices, abort, (vertices: Float32Array) => {
            Decoder.base64toint32(data.attributes.oid.data, offset, abort, (objectid: Uint8Array) => {
                const geometry = this.createGeometry(vertices); //offset
                this.createMesh(geometry);

                this.visible = tile.visible;
                this.renderer.changed = true;
                callback(this);
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
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);
        const offset = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).source);

        Decoder.base64tofloat32(data.vertices, abort, (vertices: Float32Array) => {
            Decoder.base64toint32(data.attributes.oid.data, offset, abort, (objectid: Uint8Array) => {
                const geometry = this.createGeometry(vertices); //offset
                this.createMesh(geometry);
                //normal mesh
                this.visible = tile.visible;
                this.renderer.changed = true;

                callback(this);
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
