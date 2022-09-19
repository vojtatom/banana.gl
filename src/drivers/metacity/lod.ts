import { InstancedPointModel } from "../../geometry/pointsInstanced";
import { MeshModel } from "../../geometry/mesh";
import { Layer } from "../../layer/layer";
import { MetacityTile } from "./tile";
import { PointModel } from "../../geometry/points";
import { LoadingMeshModel } from "../../geometry/loading";
import { ParsedData } from "../../workers/metacity/data";
import { MetacityDriver } from "./driver";


enum State {
    Uninitialized,
    Loading,
    Loaded
};


export class MetacityTileLOD {
    state: State = State.Uninitialized;
    private models: THREE.Object3D[] = [];
    private cache: ParsedData | undefined;
    private onload_: CallableFunction[] = [];
    private visible_: boolean = false;
    private animation_: LoadingMeshModel | undefined;

    constructor(private tile: MetacityTile, private layer: Layer, readonly lod: number) { }

    set visible(visible: boolean) {
        if (visible && this.state === State.Uninitialized) {
            this.init();
        }

        if (this.state === State.Loaded) {
            for(let i = 0; i < this.models.length; i++)
                this.models[i].visible = visible;
        }

        this.visible_ = visible;
    }

    set onload(callback: (data: ParsedData) => void) {
        if (this.state === State.Loaded && this.cache) {
            callback(this.cache);
        } else {
            this.onload_.push(callback);
        }
    }

    private async init() {
        if (this.state === State.Loading)
            return;

        this.state = State.Loading;
        for (let lod of this.tile.lods) {
            if (lod === this || lod.state === State.Uninitialized)
                continue;
            lod.onload = (models) => this.afterload(models);
            return;
        }

        this.animation_ = new LoadingMeshModel(this.tile.cx, this.tile.cy, this.tile.width, this.tile.height, this.layer.materials);
        this.layer.ctx.scene.add(this.animation_);
        this.load();
    }
    
    private load() {
        this.layer.ctx.loaders.metacity.load({
                file: this.tile.url,
                objectsToLoad: this.tile.size,
                styles: (this.layer.driver as MetacityDriver).styles,
                baseColor: this.layer.materials.baseColor,
            }, (data) => this.afterload(data));
    }
    
    private async afterload(data: ParsedData) {
        if (this.animation_){
            this.layer.ctx.scene.remove(this.animation_);
            this.animation_ = undefined;
        }
        this.state = State.Loaded;
        this.cacheAndYield(data);
        this.setupModels(data);

        //setup metadata
        for (const id in data.metadata) {
            this.layer.metadata[id] = data.metadata[id];
        }
    }

    private setupModels(data: ParsedData) {
        if (data.mesh) {
            const mesh = new MeshModel(data.mesh, this.layer.materials);
            this.models.push(mesh);
            if (this.layer.pickable)
                this.layer.ctx.picker.addPickable(mesh);
        }

        //The only actual LOD difference for now
        if (data.points) {
            const driver = this.layer.driver as MetacityDriver;
            if (this.lod === 1 && driver.pointInstance) {
                this.models.push(new InstancedPointModel(
                    data.points, this.layer.materials, driver.pointInstance.models));
            } else {
                this.models.push(new PointModel(data.points, this.layer.materials));
            }
        }

        for (let i = 0; i < this.models.length; i++) {
            this.models[i].visible = this.visible_;
            this.layer.ctx.scene.add(this.models[i]);
        }
    }

    private cacheAndYield(data: ParsedData) {
        for (let i = 0; i < this.onload_.length; i++)
            this.onload_[i](data);
        this.cache = data;
        this.onload_ = [];
    }
}


