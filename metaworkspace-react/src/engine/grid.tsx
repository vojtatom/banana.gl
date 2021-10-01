import { Vector2, Vector3 } from "three";
import { Renderer } from "./renderer";
import { Tile } from "./tile";
import { IGridData, ILayer } from "./types";


export class Grid{
    bbox: [Vector3, Vector3];
    brect: [Vector2, Vector2];
    id_counter: number;
    resolution: Vector2;
    tile_size: number;
    focus_point: Vector2;
    renderer: Renderer;
    
    tiles: (Tile)[][];
    visible_radius: number;
    visible: Set<Tile>;
    visibleSwap: Set<Tile>;

    readonly zero2: Vector2;

    layer: ILayer;

    constructor(data: IGridData, renderer: Renderer, layer: ILayer) {
        this.bbox = [new Vector3(...data.bbox[0]), new Vector3(...data.bbox[1])];
        this.brect = [new Vector2(this.bbox[0].x, this.bbox[0].y), 
                      new Vector2(this.bbox[1].x, this.bbox[1].y)];
        this.id_counter = data.id_counter;
        this.resolution = new Vector2(...data.resolution);
        this.tile_size = data.tile_size;
        this.focus_point = new Vector2();
        this.renderer =  renderer;
        this.layer = layer;

        this.tiles = [];
        this.init_tiles();

        this.visible_radius = 4000;
        this.visible = new Set<Tile>();
        this.visibleSwap = new Set<Tile>();

        this.zero2 = new Vector2();
    }


    private init_tiles() {
        for (let y = 0; y < this.resolution.y; ++y) {
            let row = [];
            for (let x = 0; x < this.resolution.x; ++x)
                row.push(this.init_tile(x, y));
            this.tiles.push(row);
        }
    }


    private init_tile(x: number, y: number) {
        const ts = this.tile_size;
        const brbase = new Vector2(x * ts, y * ts).add(this.brect[0]);
        const brtop = brbase.clone().addScalar(ts);
        const brect: [Vector2, Vector2] = [brbase, brtop];
        const tile = new Tile(this.renderer, x, y, brect, new Vector2(this.bbox[0].z, this.bbox[1].z), this.layer);
        return tile;
    }


    addTile(tile: Tile) {
        this.tiles[tile.y][tile.x] = tile;
    }


    focus(fp: Vector2) {
        fp = fp.clone().sub(this.brect[0]).divideScalar(this.tile_size);
        const nfp = fp.floor().clamp(this.zero2, this.resolution);
        if (!this.focus_point.equals(nfp)) {
            this.focus_point = nfp;
            this.update_visibility()
        } else {
        }
    }
    

    update_visibility() {
        const tmpVisible = this.visible;
        this.visible = this.visibleSwap;
        this.visibleSwap = tmpVisible;
        
        const trad = Math.ceil(this.visible_radius / this.tile_size);
        const sid = this.focus_point.clone().subScalar(trad).max(this.zero2);
        const eid = this.focus_point.clone().addScalar(trad + 1).min(this.resolution);
        
        this.visible.clear();
        for(let x = sid.x; x < eid.x; ++x) {
            for(let y = sid.y; y < eid.y; ++y) {
                const tile = this.tiles[y][x]
                tile.visible = true;
                this.visible.add(tile);
            }
        }

        this.visibleSwap.forEach((tile: Tile) => {
            if (!this.visible.has(tile)){
                tile.visible = false;
            }
        });
    }


}