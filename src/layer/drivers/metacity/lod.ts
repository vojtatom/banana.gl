import { ParsedData } from "../../../workers/metacity/worker";
import { InstancedPointModel } from "../../geometry/pointsInstanced";
import { MeshModel } from "../../geometry/mesh";
import { Layer } from "../../layer";
import { MetacityTile } from "./tile";
import { PointModel } from "../../geometry/points";
import { LoadingMeshModel } from "../../geometry/loading";


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
        this.state = State.Loading;
        for (let lod of this.tile.lods) {
            if (lod === this || lod.state === State.Uninitialized)
                continue;
            lod.onload = (models) => this.afterload(models);
            return;
        }

        const animation = new LoadingMeshModel(this.tile.cx, this.tile.cy, this.tile.width, this.tile.height, this.layer.materials);
        this.layer.ctx.scene.add(animation);
        const data = await this.load();
        this.afterload(data);
        this.layer.ctx.scene.remove(animation);
    }
    
    private load() {
        return new Promise<ParsedData>(resolve => {
            this.layer.ctx.loaders.metacity.load({
                file: this.tile.url,
                objectsToLoad: this.tile.size,
                styles: this.layer.styles,
                baseColor: this.layer.materials.baseColor,
            }, resolve)
        });
    }
    
    private afterload(data: ParsedData) {
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
            if (this.lod === 1 && this.layer.pointInstance) {
                this.models.push(new InstancedPointModel(
                    data.points, this.layer.materials, this.layer.pointInstance.models));
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


