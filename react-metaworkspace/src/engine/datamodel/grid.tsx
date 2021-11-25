import { Vector2, Vector3 } from "three";
import { Renderer } from "../renderer/renderer";
import { Tile } from "./tile";
import { IVecBBox, ILayout } from "../types";
import { Layer, Overlay } from "./layer";
import { LayerStyle } from "../renderer/style";


function getNthTriangularNumber(n: number) {
    return (n * (n + 1)) / 2;
}


function toSpiral(x: number, y: number) {
    let level = Math.max(Math.abs(x), Math.abs(y))

    if (x === 0 && y === 0) {
        return 0
    }

    let base = getNthTriangularNumber(level - 1) * 8;

    if ((x > Math.abs(y)) || (x === y && x > 0)) {
        return base + level + y;
    } else if (((y > Math.abs(x)) || (y === -x)) && (y > 0)) {
        return base + (level * 4) - (level) - x;
    } else if ((x < y) || ((x === y) && (x < 0))) {
        return base + (level * 5) - y;
    } else if ((y < x) || ((-y === x) && (y < 0))) {
        return base + (level * 7) + x;
    }
    throw new Error("Cannot covert to 1D");
}

function extend(a: IVecBBox, b: IVecBBox) {
    a[0].min(b[0]);
    a[1].max(b[1]);
}

function center(b: IVecBBox) {
    return new Vector2((b[0].x + b[1].x) * 0.5, (b[0].y + b[1].y) * 0.5);
}


export class Grid {
    bbox: IVecBBox;
    brect: [Vector2, Vector2];
    focusPoint: Vector2;
    renderer: Renderer;
    tileSize: number;

    tiles: Map<number, Tile>;
    visible_radius: number;
    visible: Set<Tile>;
    visibleSwap: Set<Tile>;
    readonly zero2: Vector2;
    layer: Layer | Overlay;
    
    constructor(data: ILayout, renderer: Renderer, layer: Layer | Overlay) {
        this.tileSize = data.tile_size;
        this.renderer = renderer;
        this.layer = layer;

        this.bbox = [new Vector3(Infinity, Infinity, Infinity), new Vector3(-Infinity, -Infinity, -Infinity)];
        this.tiles = new Map<number, Tile>();
        
        this.createTiles(data, renderer, layer);
        
        this.brect = [new Vector2(this.bbox[0].x, this.bbox[0].y), new Vector2(this.bbox[1].x, this.bbox[1].y)];
        this.focusPoint = new Vector2(Infinity, Infinity);
        
        this.visible_radius = 2000;
        this.visibleSwap = new Set<Tile>();
        this.visible = new Set<Tile>();
        
        this.zero2 = new Vector2();
    }

    get center() {
        return center(this.bbox);
    }

    hide() {
        for (const tile of this.visible.values()) {
            tile.visible = false;
        }
    }

    show() {
        for (const tile of this.visible.values()) {
            tile.visible = true;
        }
    }
    
    private createTiles(data: ILayout, renderer: Renderer, layer: Layer | Overlay) {
        for (const tiledata of data.tiles) {
            let idx = toSpiral(tiledata.x, tiledata.y);
            const tile = new Tile(tiledata, renderer, layer);
            extend(this.bbox, tile.bbox);
            this.tiles.set(idx, tile);
        }
    }

    updateVisibleTiles(fp: Vector3) {
        const visibleTile = this.focusPoint.clone().divideScalar(this.tileSize).floor()
        const nvisibleTile = new Vector2(fp.x, fp.y).divideScalar(this.tileSize).floor();

        if (!visibleTile.equals(nvisibleTile)) {
            this.focusPoint.set(fp.x, fp.y);
            this.updateVisibility(nvisibleTile)
        } 
    }

    reloadVisibility() {
        this.updateVisibility(this.focusPoint.clone().divideScalar(this.tileSize).floor());
    }

    updateVisibility(visibleTile: Vector2) {
        const tmpVisible = this.visible;
        this.visible = this.visibleSwap;
        this.visibleSwap = tmpVisible;

        const trad = Math.ceil(this.visible_radius / this.tileSize);
        const sid = visibleTile.clone().subScalar(trad);
        const eid = visibleTile.clone().addScalar(trad + 1);

        this.visible.clear();

        for (let x = sid.x; x < eid.x; ++x) {
            for (let y = sid.y; y < eid.y; ++y) {
                let idx = toSpiral(x, y);
                const tile = this.tiles.get(idx);
                if (tile)
                {
                    tile.visible = true;
                    this.visible.add(tile);
                }
            }
        }

        this.visibleSwap.forEach((tile: Tile) => {
            if (!this.visible.has(tile)) {
                tile.visible = false;
            }
        });
    }
}