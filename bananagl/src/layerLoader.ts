import { Layer } from "./layer";
import axios from "axios";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


type TileType = {
    x: number;
    y: number;
    file: string;
    size: number;
}


type LayoutType = {
    tileWidth: number;
    tileHeight: number;
    tiles: TileType[];
}


export class LayerLoader {
    private layer: Layer;
    private path: string;
    private layout: LayoutType | undefined;

    constructor(layer: Layer, path: string) {
        this.layer = layer;
        this.path = path;
        this.getLayout();
    }

    private getLayout() {
        axios.get(`${this.path}/layout.json`).then((response) => {
            this.layout = response.data;
            this.load();
        }).catch((error) => {
            console.error(`Could not load layout for layer ${this.path}`);
            console.log(error);
        });
    }

    private load() {
        if (this.layout) {
            this.layout.tiles.forEach((tile) => {
                this.loadTile(tile);
            });
        }
    }

    private loadTile(tile: TileType): any {
        console.log(`Loading tile ${tile.x} ${tile.y}, ${tile.file}`);
        const loader = new GLTFLoader();
        loader.load(`${this.path}/${tile.file}`, (gltf) => {
            this.layer.onDataLoaded(gltf.scene);
        }, undefined, (error) => {
            console.error(`Could not load tile ${tile.x} ${tile.y}, ${tile.file}`);
            console.log(error);
        });
    }
}