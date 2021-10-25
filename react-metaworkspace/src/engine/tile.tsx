import { ITile, ILayer, SCALE } from "./types";
import { Renderer } from "./renderer"
import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import iaxios from "../axios";
import { Decoder } from "./decoder";
import { Model, PolygonalModel } from "./models";


export class Tile {
    bbox: [Vector3, Vector3];
    brect: [Vector2, Vector2];
    x: number;
    y: number;
    renderer: Renderer;
    layer: ILayer;
    sourceFile: string;

    private isVisible: boolean;
    private placeholder: THREE.Mesh;
    private models: Model[];



    constructor(data: ITile, renderer: Renderer, layer: ILayer) {
        this.bbox = [new Vector3(...data.box[0]).divideScalar(SCALE), new Vector3(...data.box[1]).divideScalar(SCALE)];
        this.brect = [new Vector2(this.bbox[0].x, this.bbox[0].y).divideScalar(SCALE), new Vector2(this.bbox[1].x, this.bbox[1].y).divideScalar(SCALE)];
        this.x = data.x;
        this.y = data.y;
        this.sourceFile = data.file;
        this.layer = layer;
        this.renderer = renderer;
        this.isVisible = false;
        this.models = [];
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

    renderPlaceholder() {
        const dxy = this.brect[1].clone().sub(this.brect[0]);
        const dz = this.bbox[1].z - this.bbox[0].z;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.translate(0.5, 0.5, 0.5);
        geometry.scale(dxy.x, dxy.y, dz)
        geometry.translate(this.brect[0].x, this.brect[0].y, this.bbox[0].z);
        const material = new THREE.MeshBasicMaterial( {color: 0xF8f8f8, side: THREE.DoubleSide} );
        const placeholder = new THREE.Mesh( geometry, material );
        this.renderer.scene.add( placeholder );
        placeholder.visible = false;
        return placeholder
    }

    forRender() {
        iaxios.get(`/data/${this.layer.project}/${this.layer.name}/grid/tiles/${this.sourceFile}`).then(
            (response) => {
                for(const data of response.data) {
                    if (data.type === "simplepolygon")
                        this.models.push(new PolygonalModel(data, this.renderer));
                }

                if (response.data.length > 0) {
                    this.placeholder.visible = false;
                }

                this.postRenderCheck();
            }
        )
    }

    postRenderCheck() {
        if(!this.isVisible)
            this.stopRender();
    }

    stopRender() {
        if (this.models.length > 0){
            for(const m of this.models)
                m.remove();
            this.models = [];
            //this.placeholder.visible = true;
        }
    }
}