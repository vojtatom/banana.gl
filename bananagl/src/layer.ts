import { LayerLoader } from "./loader";
import { Mesh, BufferGeometry, BufferAttribute } from "three";
import { Graphics } from "./graphics";
import { ObjectSelection } from "./selection";
import { MaterialLibrary, MaterialLibraryProps } from "./material";
import { Style, StylerWorkerPool } from "./styles";

export type LayerProps = {
    path: string;
    name?: string;
    material?: MaterialLibraryProps;
    pickable?: boolean;
    styles?: Style[];
}

export type Metadata = {[id: number]: any};

type ParsedGeometry = {
    positions: Float32Array;
    normals: Float32Array;
    ids: Float32Array;
    metadata: Metadata;
}



export class Layer {
    name: string;
    loader: LayerLoader;
    graphics: Graphics;
    metadata: Metadata;
    styles: Style[];
    selection: ObjectSelection[] = [];
    readonly materialLibrary : MaterialLibrary;
    readonly pickable: boolean;
    
    constructor(props: LayerProps, graphics: Graphics) {
        this.materialLibrary = new MaterialLibrary(graphics.resolution, props.material);
        this.name = props.name? props.name : props.path;
        this.graphics = graphics;
        this.loader = new LayerLoader(this, props.path);
        this.pickable = props.pickable ?? false;
        this.styles = props.styles ?? [];
        this.metadata = {};
    }

    locate(x: number, y: number) {
        this.loader.locate(x, y);
    }

    private addMetadata(metadata: Metadata) {
        for (const id in metadata) {
            if (this.metadata.hasOwnProperty(id)) {
                console.log("conflict", id, this.metadata[id], metadata[id]);
            }
            this.metadata[id] = metadata[id];
        }
    }

    private getMetadata(id: number) {
        if (this.metadata.hasOwnProperty(id)) {
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
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(parsed_geometry.positions, 3));
        geometry.setAttribute('normal', new BufferAttribute(parsed_geometry.normals, 3));
        geometry.setAttribute('idcolor', new BufferAttribute(parsed_geometry.ids, 3));
        const m = new Mesh(geometry, this.materialLibrary.default);
        this.graphics.scene.add(m);

        this.styles.forEach((style) => {
            StylerWorkerPool.Instance.process({
                style: style,
                metadata: parsed_geometry.metadata,
                ids: parsed_geometry.ids
            }, (results) => {
                const { color } = results;
                geometry.setAttribute('color', new BufferAttribute(color, 3));
                this.materialLibrary.default.vertexColors = true;
                this.materialLibrary.default.needsUpdate = true;
            })
        });

        if (this.pickable) {
            this.graphics.picker.addPickable(m);
        }
    }
}