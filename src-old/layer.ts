import { Graphics } from './graphics';
import { ObjectSelection } from './selection';
import { MaterialLibrary } from './material';
import { Style } from './styles';
import { LayerProps, LayerType, LayoutType, MetadataTable, ParsedGeometry, TileType } from './types';
import axios from 'axios';
import * as THREE from 'three';
import { LoaderWorkerPool } from './loader';
import { LoadingAnimation } from './models/loadingAnimation';
import { MeshGeometry } from './models/mesh';
import { PointInstance, PointsGeometry } from './models/points';



export class Layer {
    name: string;
    metadata: MetadataTable;
    styles: Style[];
    selection: ObjectSelection[] = [];
    
    readonly graphics: Graphics;
    readonly materialLibrary : MaterialLibrary;
    readonly pickable: boolean;
    readonly path: string;
    
    private pointInstance?: PointInstance;
    private layout?: LayoutType;
    
    constructor(props: LayerProps, graphics: Graphics) {
        this.materialLibrary = new MaterialLibrary(graphics.resolution, props.material);
        this.name = props.name? props.name : props.path;
        this.graphics = graphics;
        this.pickable = props.pickable ?? false;
        this.styles = props.styles ?? [];
        this.path = props.path;
        this.metadata = {};

        if (props.points && props.points.instanceModel) {
            this.pointInstance = new PointInstance(props.points.instanceModel);
        }

        axios.get(`${this.path}/layout.json`).then((response) => {
            this.layout = response.data;

            if (!this.layout)
                return;

            function median(arr: number[]) {
                arr.sort();
                const mid = Math.floor(arr.length / 2);
                if (arr.length % 2)
                    return arr[mid];
                return (arr[mid - 1] + arr[mid]) / 2;
            }
    
            const xmedian = median(this.layout.tiles.map((tile) => tile.x)) * this.layout.tileWidth;
            const ymedian = median(this.layout.tiles.map((tile) => tile.y)) * this.layout.tileHeight;
            const nav = this.graphics.navigation;
            
            if (this.graphics.navigation.isSet)
                this.locate(nav.target.x, nav.target.y);
            else {
                const target = new THREE.Vector3(xmedian, ymedian, 0);
                this.graphics.focus(target);
            }  

        }).catch((error) => {
            console.error(`Could not load layout for layer ${this.path}`);
            console.error(error);
        });
    }

    locate(x: number, y: number) {
        const RADIUS = 2000 * 2000;
        console.log(x, y);
        if (this.layout) {
            const halfx = this.layout.tileWidth * 0.5;
            const halfy = this.layout.tileHeight * 0.5;
            this.layout.tiles.forEach((tile) => {
                if (this.layout) {
                    const dx = tile.x * this.layout.tileWidth + halfx - x;
                    const dy = tile.y * this.layout.tileHeight + halfy - y;
                    const d = dx * dx + dy * dy;
                    if (d < RADIUS) {
                        this.loadTile(tile);
                    }
                }
            });
        }
    }

    private loadTile(tile: TileType) {
        if (tile.loaded || !this.layout)
            return;

        tile.loaded = true;
        const loading = new LoadingAnimation(tile, this.layout, this.graphics);
        const url = new URL(`${this.path}/${tile.file}`, window.location.href);

        LoaderWorkerPool.Instance.process({
            file: url.toString(),
            objectsToLoad: tile.size
        }, (scene) => {
            loading.finished();
            this.onDataLoaded(scene);
        });

    }

    private addMetadata(metadata: MetadataTable) {
        for (const id in metadata) {
            if (Object.prototype.hasOwnProperty.call(this.metadata, id)) {
                console.log('conflict', id, this.metadata[id], metadata[id]);
            }
            this.metadata[id] = metadata[id];
        }
    }

    private getMetadata(id: number) {
        if (Object.prototype.hasOwnProperty.call(this.metadata, id)) {
            console.log(this.metadata[id]);
            return this.metadata[id];
        }
    }

    select(id: number) {
        const metadata = this.getMetadata(id);
        if (metadata) {
            this.deselect();
            const { bbox } = metadata;
            this.selection.push(new ObjectSelection({
                graphics: this.graphics,
                bbox: bbox,
                material: this.materialLibrary,
            }));
        }
    }

    deselect() {
        this.selection.forEach((selection) => {
            selection.remove();
        });

        this.selection.length = 0;
    }

    onDataLoaded(parsed_geometry: ParsedGeometry) {
        this.addMetadata(parsed_geometry.metadata);

        if (parsed_geometry.type === LayerType.Mesh) {
            new MeshGeometry(this, parsed_geometry);
        } else if (parsed_geometry.type === LayerType.Points) {
            new PointsGeometry(this, parsed_geometry, this.pointInstance);
        } else {
            //TODO lines
        }
    }
}