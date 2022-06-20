import { Layer } from "./layer";
import axios from "axios";

type TileType = {
    x: number;
    y: number;
    file: string;
}


type LayoutType = {
    tile_xdim: number;
    tile_ydim: number;
    tile_list: TileType[];
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
        this.layer.objects = [];
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
            this.layout.tile_list.forEach((tile) => {
                this.loadTile(tile);
            });
        }
    }

    private loadTile(tile: TileType): any {
        console.log(`Loading tile ${tile.x} ${tile.y}, ${tile.file}`);
        axios.get(`${this.path}/${tile.file}`).then((response) => {
            console.log(response.data);
            console.log(`Loaded tile ${tile.file}`);
        });
    }
}