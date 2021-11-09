import { ITile } from "../types";
import { Layer, Overlay } from "./layer";
import { Renderer } from "../renderer/renderer"
import { Vector2, Vector3 } from "three";
import iaxios from "../../axios";
import axios from "axios";
import { Model } from "../geometry/base"
import { deserializeModel } from "../geometry/deserialize"

class TileLoader {
    //axios stop request
    stopFlag!: any;
    loaded: boolean;

    constructor() {
        this.loaded = false;
    }
    
    get(tile: Tile, callback: CallableFunction) {
        this.stopFlag = axios.CancelToken.source();
        iaxios.get(`/api/data/${tile.layer.project}/${tile.layer.name}/grid/tiles/${tile.sourceFile}`, {
            cancelToken: this.stopFlag.token
        }).then(
            (response) => {
                if (this.loaded) //to avoid race conditions
                    return;

                this.loaded = true;
                callback(response.data);
            }
        ).catch((reject) => {
            //TODO
        });
    }

    abort() {
        this.stopFlag.cancel();
    }
}


export class Tile {
    bbox: [Vector3, Vector3];
    brect: [Vector2, Vector2];
    x: number;
    y: number;
    renderer: Renderer;
    layer: Layer | Overlay;
    sourceFile: string;

    private isVisible: boolean;
    private models: Model[];
    private loader: TileLoader;


    constructor(data: ITile, renderer: Renderer, layer: Layer | Overlay) {
        this.bbox = [new Vector3(...data.box[0]), new Vector3(...data.box[1])];
        this.brect = [new Vector2(this.bbox[0].x, this.bbox[0].y), new Vector2(this.bbox[1].x, this.bbox[1].y)];
        this.x = data.x;
        this.y = data.y;
        this.sourceFile = data.file;
        this.layer = layer;
        this.renderer = renderer;
        this.isVisible = false;
        this.models = [];
        this.loader = new TileLoader();
    }

    set visible(isVisible: boolean) {
        if (this.isVisible === isVisible)
            return;

        this.isVisible = isVisible;

        if (isVisible)
            this.show();
        else 
            this.hide();
    }

    get visible() {
        return this.isVisible;
    }

    show() {
        if (!this.loader.loaded) {
            this.loader.get(this, (models: Array<any>) => {
                for (let modeldata of models) {
                    const model = deserializeModel(modeldata, this);
                    if (model)
                        this.models.push(model);
                }
            });
        } 

        for (const m of this.models)
            m.visible = true;
    }

    hide() {
        if (!this.loader.loaded){
            this.loader.abort();
        }

        for (const m of this.models)
            m.visible = false;
    }

    remove() {
        if (this.models.length > 0) {
            for (const m of this.models)
                m.remove();
            this.models = [];
        }
    }
}