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
                const geometry = this.createGeometry(vertices, objectid); //offset
                this.createMesh(geometry);
                this.createPickingMesh(geometry);

                this.visible = tile.visible;
                this.renderer.changed = true;
                callback(this);
            });
        });
    }

    private createPickingMesh(geometry: THREE.BufferGeometry) {
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingLineMaterial);
        pickingMesh.frustumCulled = false;
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.InstancedBufferGeometry) {
        const mesh = new THREE.Mesh(geometry, this.renderer.matlib.lineMaterial);
        mesh.frustumCulled = false; //this one was a big pain to figure out...
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectID: Uint8Array) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = vertices.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segment()), 3));
        geometry.setAttribute('lineStart', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 0));

        geometry.setAttribute('lineEnd', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 3));

        geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(objectID, 4, true, 1));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(this.baseColors(vertices.length), 3, true, 1));

        return geometry;
    }
}

export class LineProxyModel extends Model {
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);

        const offset_source = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).source);
        const offset_target = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).target);

        Decoder.base64tofloat32(data.vertices, abort, (vertices: Float32Array) => {
            Decoder.base64toint32(data.attributes.source_oid.data, offset_source, abort, (objectid: Uint8Array) => {    
                const geometry = this.createGeometry(vertices, objectid); //offset
                this.createMesh(geometry);
                this.createPickingMesh(geometry);

                this.visible = tile.visible;
                this.renderer.changed = true;
                callback(this);
            });
        });
    }

    private createPickingMesh(geometry: THREE.BufferGeometry) {
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingLineMaterial);
        pickingMesh.frustumCulled = false;
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.InstancedBufferGeometry) {
        const mesh = new THREE.Mesh(geometry, this.renderer.matlib.lineMaterial);
        mesh.frustumCulled = false; //this one was a big pain to figure out...
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectID: Uint8Array) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = vertices.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segment()), 3));
        geometry.setAttribute('lineStart', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 0));

        geometry.setAttribute('lineEnd', new THREE.InterleavedBufferAttribute(
            new THREE.InstancedInterleavedBuffer(vertices, 6, 1), 3, 3));
        
        geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(objectID, 4, true, 1));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(this.baseColors(vertices.length), 3, true, 1));

        return geometry;
    }
}
