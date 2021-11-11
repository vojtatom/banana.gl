import { IModel } from "../types";
import * as THREE from "three";
import { Decoder } from "../utils/decoder";
import { Tile } from "../datamodel/tile";
import { Model, ModelProxy } from "./base";
import { Overlay } from "../datamodel/layer";


export class PolygonalModel extends Model {
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);
        const offset = tile.renderer.picker.offsetForLayer(tile.layer.name);
        Decoder.base64tofloat32(data.vertices, abort, (vertices: Float32Array) => {
            Decoder.base64toint32(data.attributes.oid.data, offset, abort, (objectid: Uint8Array) => {    
                this.init(vertices, objectid, tile);
                callback(this);
            });
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
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingMaterial);
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.BufferGeometry) {
        const material = this.renderer.matlib.polygonSelectMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectid: Uint8Array) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('objectID', new THREE.BufferAttribute(objectid, 4, true));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.baseColors(vertices.length), 3, true));
        geometry.computeVertexNormals();
        return geometry;
    }
}


export class PolygonalProxyModel extends ModelProxy {
    constructor(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) {
        super(tile.renderer);
        const offset_source = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).source);
        const offset_target = tile.renderer.picker.offsetForLayer((tile.layer as Overlay).target);
        
        Decoder.base64tofloat32(data.vertices, abort, (vertices: Float32Array) => {
            Decoder.base64toint32(data.attributes.source_oid.data, offset_source, abort, (objectid: Uint8Array) => {    
                this.init(vertices, objectid, tile);
                callback(this);
            });
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
        const pickingMesh = new THREE.Mesh(geometry, this.renderer.matlib.pickingMaterial);
        this.renderer.pickingScene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createMesh(geometry: THREE.BufferGeometry) {
        const material = this.renderer.matlib.polygonSelectMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createGeometry(vertices: Float32Array, objectid: Uint8Array) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('objectID', new THREE.BufferAttribute(objectid, 4, true));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.baseColors(vertices.length), 3, true));
        geometry.computeVertexNormals();
        return geometry;
    }
}