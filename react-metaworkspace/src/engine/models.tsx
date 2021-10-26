import { IModel, INVSCALE } from "./types";
import { Renderer } from "./renderer"
import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import iaxios from "../axios";
import { Decoder } from "./decoder";


export abstract class Model {
    renderer: Renderer;
    mesh: THREE.Mesh | undefined;
    removed: boolean;
    
    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.removed = false;
    }

    abstract remove(): void;
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
                geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
                geometry.setAttribute( 'objectID', new THREE.BufferAttribute( objectid, 4, true ) );
                geometry.computeVertexNormals();

                //normal mesh
                const mesh = new THREE.Mesh( geometry, this.renderer.material ); //TODO change to normal material
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                mesh.scale.set(INVSCALE, INVSCALE, INVSCALE);
                this.renderer.scene.add(mesh);
                
                //picking mesh
                const pickingMesh = new THREE.Mesh( geometry, this.renderer.pickingMaterial ); //TODO change to normal material
                pickingMesh.scale.set(INVSCALE, INVSCALE, INVSCALE);
                this.renderer.pickingScene.add(pickingMesh);

                this.renderer.changed = true;
                this.mesh = mesh;

                if (this.removed)
                    this.remove();

            });
        });
    }



    remove() {
        this.removed = true;
        if (this.mesh){
            const mesh = this.mesh;

            this.renderer.scene.remove(mesh);
            mesh.geometry.dispose();
            /*const ms = mesh.material;
            if (Array.isArray(ms)){
                for(const m of ms)
                    m.dispose();
            } else {
                (ms as THREE.Material).dispose();
            }*/

            this.mesh = undefined;
        }
    }
}