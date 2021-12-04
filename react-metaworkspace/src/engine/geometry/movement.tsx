import { IMove } from "../types";
import * as THREE from "three";
import { Decoders, DecoderQueryType } from "../utils/workers";
import { Interval } from "../datamodel/interval";
import { Model } from "./base";


export class Move extends Model {
    time: number;

    constructor(data: IMove, interval: Interval, callback: CallableFunction, abort: CallableFunction) {
        super(interval.renderer);
        this.time = data.time;
        const offset = interval.layer.getOffset();

        Decoders.Instance.process([
            {
                datatype: DecoderQueryType.float32,
                buffer: data.from
            }, {
                datatype: DecoderQueryType.float32,
                buffer: data.to
            }, {
                datatype: DecoderQueryType.int32,
                buffer: data.oid,
                offset: offset
            }, {
                datatype: DecoderQueryType.float32,
                buffer: data.from_speed,
            },{
                datatype: DecoderQueryType.float32,
                buffer: data.to_speed,
            }], 
            (from: Float32Array, to: Float32Array, objectid: Uint8Array, from_speed: Float32Array, to_speed: Float32Array) => {
                    console.log(interval.layer.name, from);
                    this.init(from, to, objectid, from_speed, to_speed);
                    callback(this);
            });
        }

    private init(from: Float32Array, to: Float32Array, objectid: Uint8Array, from_speed: Float32Array, to_speed: Float32Array) {
        const geometry = this.createGeometry(from, to, objectid, from_speed, to_speed);
        this.createMesh(geometry);
        this.createPickingMesh(geometry);
        this.visible = true;
        this.renderer.changed = true;
    }

    private createMesh(geometry: THREE.BufferGeometry) {
        const material = this.renderer.matlib.agentMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        //mesh.receiveShadow = true;
        //mesh.castShadow = true;
        this.renderer.scene.add(mesh);
        this.mesh = mesh;
    }

    private createPickingMesh(geometry: THREE.BufferGeometry) {
        const material = this.renderer.matlib.pickingAgentMaterial;
        const pickingMesh = new THREE.Mesh(geometry, material);
        pickingMesh.frustumCulled = false;
        this.renderer.pickingScene.add(pickingMesh);
        //this.renderer.scene.add(pickingMesh);
        this.pickingMesh = pickingMesh;
    }

    private createGeometry(from: Float32Array, to: Float32Array, objectid: Uint8Array, from_speed: Float32Array, to_speed: Float32Array) {
        const symbol = new THREE.OctahedronGeometry(35, 0);
        const symbolGeometry = new Float32Array(symbol.attributes.position.array);
        symbol.dispose();

        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = from.length / 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(symbolGeometry, 3));
        geometry.setAttribute('from', new THREE.InstancedBufferAttribute(from, 3, false, 1));
        geometry.setAttribute('from_speed', new THREE.InstancedBufferAttribute(from_speed, 1, false, 1));
        geometry.setAttribute('to', new THREE.InstancedBufferAttribute(to, 3, false, 1));
        geometry.setAttribute('to_speed', new THREE.InstancedBufferAttribute(to_speed, 1, false, 1));
        geometry.setAttribute('objectID', new THREE.InstancedBufferAttribute(objectid, 4, true, 1));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(this.baseColors(from.length), 3, true, 1));
        geometry.computeVertexNormals();
        return geometry;
    }
}


