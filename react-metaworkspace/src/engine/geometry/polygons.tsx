import { IModel } from "../types";
import * as THREE from "three";
import { Decoder } from "../utils/decoder";
import { Tile } from "../datamodel/tile";
import { Model } from "./base";


export class PolygonalModel extends Model {
    constructor(data: IModel, tile: Tile) {
        super(tile.renderer);
        const offset = tile.renderer.picker.offsetForLayer(tile.layer.name);
        Decoder.base64tofloat32(data.vertices, (vertices: Float32Array) => {
            Decoder.base64toint32(data.attributes.oid.data, offset, (objectid: Uint8Array) => {    
                this.init(vertices, objectid, tile);
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

    private createGeometry(vertices: Float32Array, objectid: Uint8Array | undefined = undefined) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        if (objectid)
            geometry.setAttribute('objectID', new THREE.BufferAttribute(objectid, 4, true));
        geometry.computeVertexNormals();
        return geometry;
    }
}