import { IModel } from "../types";
import * as THREE from "three";
//import { Decoder } from "../utils/decoder";
import { Decoders, DecoderQueryType } from "../utils/workers";
import { Tile } from "../datamodel/tile";
import { Model, ModelProxy } from "./base";
import { Overlay } from "../datamodel/layer";


export class PointModel extends Model {
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);
        const offset = tile.renderer.picker.offsetForLayer(tile.layer.name);

        Decoders.Instance.process(
            [{
                datatype: DecoderQueryType.float32,
                buffer: data.vertices
            }, {
                datatype: DecoderQueryType.int32,
                buffer: data.attributes.oid.data,
                offset: offset
            }],
            (vertices: Float32Array, objectid: Uint8Array) => {
                this.init(vertices, objectid, tile);
                callback(this);
            });

    }

    private init(vertices: Float32Array, objectid: Uint8Array, tile: Tile) {
        const geometry = this.createGeometry(vertices, objectid);
        this.createMesh(geometry);
        this.createPickingMesh(geometry);
        this.visible = tile.visible;
        this.renderer.changed = true;
    }


    private createPickingMesh(geometry: THREE.BufferGeometry) {
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingPointMaterial);
        pickingMesh.frustumCulled = false;
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.BufferGeometry) {
        const material = this.renderer.matlib.pointMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectid: Uint8Array) {
        const symbol = new THREE.OctahedronGeometry(5, 0);
        const symbolGeometry = new Float32Array(symbol.attributes.position.array);
        symbol.dispose();

        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = vertices.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(symbolGeometry, 3));
        geometry.setAttribute('location', new THREE.InstancedBufferAttribute(vertices, 3, false, 1));
        geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(objectid, 4, true, 1));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(this.baseColors(vertices.length), 3, true, 1));
        geometry.computeVertexNormals();
        return geometry;
    }
}


export class PointProxyModel extends ModelProxy {
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);
        const offset_source = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).source);
        const offset_target = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).target);

        Decoders.Instance.process(
            [{
                datatype: DecoderQueryType.float32,
                buffer: data.vertices
            }, {
                datatype: DecoderQueryType.int32,
                buffer: data.attributes.source_oid.data,
                offset: offset_source
            }], 
            (vertices: Float32Array, objectid: Uint8Array) => {
                this.init(vertices, objectid, tile);
                callback(this);
            });

    }

    private init(vertices: Float32Array, objectid: Uint8Array, tile: Tile) {
        const geometry = this.createGeometry(vertices, objectid);
        this.createMesh(geometry);
        this.createPickingMesh(geometry);
        this.visible = tile.visible;
        this.renderer.changed = true;
    }


    private createPickingMesh(geometry: THREE.BufferGeometry) {
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingPointMaterial);
        pickingMesh.frustumCulled = false;
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.BufferGeometry) {
        const material = this.renderer.matlib.pointMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectid: Uint8Array) {
        const symbol = new THREE.OctahedronGeometry(5, 0);
        const symbolGeometry = new Float32Array(symbol.attributes.position.array);
        symbol.dispose();

        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = vertices.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(symbolGeometry, 3));
        geometry.setAttribute('location', new THREE.InstancedBufferAttribute(vertices, 3, false, 1));
        geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(objectid, 4, true, 1));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(this.baseColors(vertices.length), 3, true, 1));
        geometry.computeVertexNormals();
        return geometry;
    }
}
