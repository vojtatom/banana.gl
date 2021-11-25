import { ITile } from "../types";
import { Layer, Overlay } from "./layer";
import { Renderer } from "../renderer/renderer"
import { Vector2, Vector3 } from "three";
import iaxios from "../../axios";
import axios from "axios";
import { Model } from "../geometry/base"
import { deserializeModel } from "../geometry/deserialize"
import { LayerStyle } from "../renderer/style";

class TileLoader {
    //axios stop request
    stopFlag: any;
    loaded: boolean;

    constructor() {
        this.loaded = false;
    }

    get(tile: Tile, callback: CallableFunction) {
        this.stopFlag = axios.CancelToken.source();
        tile.renderer.status.actions.loadingGeometry.start();

        iaxios.get(`/api/data/${tile.layer.project}/${tile.layer.name}/grid/stream/${tile.sourceFile}`, {
            cancelToken: this.stopFlag.token
        }).then(
            (response) => {
                tile.renderer.status.actions.loadingGeometry.stop();

                if (this.loaded) //to avoid race conditions
                    return;

                this.loaded = true;
                this.stopFlag = null;
                callback(response.data);
            }
        ).catch((reject) => {
            tile.renderer.status.actions.loadingGeometry.stop();
            this.stopFlag = null;
        });
    }

    abort() {
        if (this.stopFlag)
            this.stopFlag.cancel();
        this.stopFlag = null;
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
    models: Model[];
    private isVisible: boolean;
    private loader: TileLoader;
    private caching: boolean; 


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
        this.caching = false;
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

                if (!this.isVisible && !this.caching)
                    return this.disposeCache();


                for (let modeldata of models) {

                    this.renderer.status.actions.parsingGeometry.start();
                    deserializeModel(modeldata, this, (model: Model) => {
                        this.renderer.status.actions.parsingGeometry.stop();
                        this.models.push(model);

                        if (!this.isVisible && !this.caching)
                            return this.disposeCache();

                        this.layer.applyStyleToModels(this.models);

                        if (!this.isVisible && !this.caching)
                        return this.disposeCache();

                    }, () => {
                        if (!this.isVisible)
                        {
                            this.renderer.status.actions.parsingGeometry.stop();
                            this.disposeCache();
                        }
                        
                        return !this.isVisible;}
                    );
                }
            });
        }

        if (this.caching) {
            for (const m of this.models)
                m.visible = true;
        }
    }

    hide() {
        if (!this.loader.loaded) {
            this.loader.abort();
        }
        
        if (!this.caching) {
            this.disposeCache();
        } else {
            for (const m of this.models)
                m.visible = false;
        }
    }

    remove() {
        if (this.models.length > 0) {
            for (const m of this.models)
                m.remove();
            this.models = [];
        }
    }

    enableCache() {
        this.caching = true;
    }

    disableCache() {
        this.caching = false;

        if (!this.isVisible) {
            this.disposeCache();
        }
    }
    
    disposeCache() {
        console.log("dispose cache");
        for (const m of this.models)
            m.remove();

        this.models = [];
        this.loader.loaded = false;
    }
}