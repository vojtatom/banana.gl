import { ILayer } from "./types";
import { Renderer } from "./renderer"
import * as THREE from 'three';
import { Vector2 } from "three";
import iaxios from "../axios";
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'


function square(x: number, y: number, z: number, side: number) {
    return new Float32Array( [
        x,        y,        z,
        x + side, y,        z,
        x + side, y + side, z,
        x + side, y + side, z,
        x,        y + side, z,
        x,        y,        z
    ] );
}



class Decoder {
    static base64tofloat32(data: string) {
        let blob: string|null = window.atob(data);
		let array;
        let len = blob.length / Float32Array.BYTES_PER_ELEMENT;
        let view: DataView|null = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT));
        array = new Float32Array(len);
        
        for (let p = 0; p < len * 4; p = p + 4) {
            view.setUint8(0, blob.charCodeAt(p));
            view.setUint8(1, blob.charCodeAt(p + 1));
            view.setUint8(2, blob.charCodeAt(p + 2));
            view.setUint8(3, blob.charCodeAt(p + 3));
            array[p / 4] = view.getFloat32(0, true);
        }
        view = null;
        blob = null;
        return array;
    }
    
    static base64toint32(data: string) {
        let blob:  string|null = window.atob(data);
        let array;
        let len = blob.length / Int32Array.BYTES_PER_ELEMENT;
        let view: DataView|null = new DataView(new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
        array = new Int32Array(len);
        
        for (let p = 0; p < len * 4; p = p + 4) {
            view.setUint8(0, blob.charCodeAt(p));
            view.setUint8(1, blob.charCodeAt(p + 1));
            view.setUint8(2, blob.charCodeAt(p + 2));
            view.setUint8(3, blob.charCodeAt(p + 3));
            array[p / 4] = view.getInt32(0, true);
        }
        view = null;
        blob = null;
		return array;
	}
}

function linearToIndexed(invertices: Float32Array) {
    const vertices = [];
    const indices = [];
    let vid = 0;
    let idx;
    let xm = new Map<number, Map<number, Map<number, number>>>(), ym, zm;


    for(let i = 0; i < invertices.length; i += 3) {
        let x = invertices[i];
        let y = invertices[i + 1];
        let z = invertices[i + 2];
    
        if (!(ym = xm.get(x))){
            ym = new Map<number, Map<number, number>>();
            xm.set(x, ym);
        }

        if (!(zm = ym.get(y))) {
            zm = new Map<number, number>();
            ym.set(y, zm);
        }

        if (!(idx = zm.get(z))) {
            idx = vid++;
            zm.set(z, idx);
            vertices.push(x, y, z);
        }

        indices.push(idx);
    }


    /*let tmp;
    for(let i = 0; i < indices.length;  i += 3) {
        tmp = indices[i];
        indices[i] = indices[i + 1];
        indices[i + 1] = tmp;
    }*/

    return {
        vertices: new Float32Array(vertices),
        indices: indices
    };
}



export class Tile {
    brect: [Vector2, Vector2];
    zrange: Vector2;
    x: number;
    y: number;
    renderer: Renderer;
    layer: ILayer;

    private isVisible: boolean;
    private initialized: boolean;
    private tilePlane: THREE.Mesh | undefined;
    private placeholder: THREE.Mesh;


    constructor(renderer: Renderer, x: number, y: number, brect: [Vector2, Vector2], zrange: Vector2, layer: ILayer) {
        this.brect = brect;
        this.zrange = zrange;
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.renderer = renderer;
        this.isVisible = false;
        this.initialized = false;

        this.placeholder = this.renderPlaceholder();
    }

    set visible(isVisible: boolean) {
        if (this.isVisible === isVisible)
            return;
        
        this.isVisible = isVisible;

        if (isVisible)
            this.forRender();
        else
            this.stopRender();

    }

    get identifier() {
        return {
            project: this.layer.project,
            layer: this.layer.name, 
            x: this.x,
            y: this.y
        };
    }

    renderPlaceholder() {
        const dxy = this.brect[1].clone().sub(this.brect[0]);
        const dz = this.zrange.y - this.zrange.x;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.translate(0.5, 0.5, 0.5);
        geometry.scale(dxy.x, dxy.y, dz)
        geometry.translate(this.brect[0].x, this.brect[0].y, this.zrange.x);
        const material = new THREE.MeshBasicMaterial( {color: 0xF8f8f8, side: THREE.DoubleSide} );
        const placeholder = new THREE.Mesh( geometry, material );
        this.renderer.scene.add( placeholder );
        return placeholder
    }

    forRender() {
        //var randomColor = Math.floor(Math.random()*16777215)
        
        const material = new THREE.MeshToonMaterial( {color: 0x49ef4, side: THREE.DoubleSide} );
        //const material = new THREE.MeshNormalMaterial();

        iaxios.post('/tile', this.identifier).then(
            (response) => {
                for(const data of response.data) {
                    const vertices = Decoder.base64tofloat32(data.buffers.vertices);
                    const normals = Decoder.base64tofloat32(data.buffers.normals);
                    //let { vertices, indices } = linearToIndexed(rvertices);

                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
                    
                    
                    //geometry.setIndex(indices);
                    //geometry.computeVertexNormals();
                    geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
                    this.tilePlane = new THREE.Mesh( geometry, material );

                    //var vnh = new VertexNormalsHelper( this.tilePlane, 100, 0xff0000 );
                    this.renderer.scene.add(this.tilePlane);
                    //this.renderer.scene.add( vnh );
                }

                if (response.data.length > 0) {
                    this.placeholder.visible = false;
                }

                this.initialized = true;
                this.postRenderCheck();
            }
        )
    }

    postRenderCheck() {
        if(!this.isVisible)
            this.stopRender();
    }


    stopRender() {
        if (this.tilePlane){
            const mesh = this.tilePlane;
            this.renderer.scene.remove(mesh);
            mesh.geometry.dispose();
            const ms = mesh.material;
            if (Array.isArray(ms)){
                for(const m of ms)
                    m.dispose();
            } else  {
                (ms as THREE.Material).dispose();
            }
            this.initialized = false;
            this.tilePlane = undefined;
            this.placeholder.visible = true;
        }
    }
}