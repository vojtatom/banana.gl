import { ITile, ILayer, IOverlay } from "./types";
import { Renderer } from "./renderer"
import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import iaxios from "../axios";
import axios from "axios";
import { Model, PolygonalModel, LineModel, LineProxyModel } from "./models";


export class Tile {
    bbox: [Vector3, Vector3];
    brect: [Vector2, Vector2];
    x: number;
    y: number;
    renderer: Renderer;
    layer: ILayer | IOverlay;
    sourceFile: string;

    //axios stop request
    stopFlag: any;

    private isVisible: boolean;
    private models: Model[];


    constructor(data: ITile, renderer: Renderer, layer: ILayer | IOverlay) {
        this.bbox = [new Vector3(...data.box[0]), new Vector3(...data.box[1])];
        this.brect = [new Vector2(this.bbox[0].x, this.bbox[0].y), new Vector2(this.bbox[1].x, this.bbox[1].y)];
        this.x = data.x;
        this.y = data.y;
        this.sourceFile = data.file;
        this.layer = layer;
        this.renderer = renderer;
        this.isVisible = false;
        this.models = [];
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

    forRender() {
        this.stopFlag = axios.CancelToken.source();
        iaxios.get(`/api/data/${this.layer.project}/${this.layer.name}/grid/tiles/${this.sourceFile}`, {
            cancelToken: this.stopFlag.token
          }).then(
            (response) => {
                this.createModels(response.data);
                this.postRenderCheck();
            }
        ).catch((reject) => {
            console.log(reject);
        })
    }

    private createModels(data: Array<any>) {
        for (let modeldata of data) {
            const model = this.deserializeModel(modeldata);
            if (model)
                this.models.push(model);
        }
    }

    private deserializeModel(data: any) {
        if (data.tags && data.tags.proxy === true) {
            if (data.type === "simpleline")
                return new LineProxyModel(data, this.renderer, this.layer as IOverlay);
        } else {
            if (data.type === "simplepolygon")
                return new PolygonalModel(data, this.renderer, this.layer);

            if (data.type === "simpleline")
                return new LineModel(data, this.renderer, this.layer);
        }
    }

    postRenderCheck() {
        if (!this.isVisible)
            this.stopRender();
    }

    stopRender() {
        if (this.models.length > 0) {
            for (const m of this.models)
                m.remove();
            this.models = [];
        }

        if (this.stopFlag){
            this.stopFlag.cancel();
            this.stopFlag = null;
        }
    }
}