import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from './materials';
import { Style } from '../workers/metacity/style/style';
import { PointInstance } from './geometry/instance';
import { Driver, DriverProps } from './drivers/driver';
import { MetacityDriver, MetacityDriverProps } from './drivers/metacity/driver';


export type MetadataRecord = any;
export type MetadataTable = { [id: number]: MetadataRecord }


export interface LayerProps extends MaterialLibraryProps, MetacityDriverProps {
    api: string;
    pickable: boolean;
    pointInstance: string;
    styles: Style[];
}

export class Layer {
    readonly api: string;
    readonly materials: MaterialLibrary;
    readonly metadata: MetadataTable;
    readonly styles: string[] = [];
    readonly pointInstance: PointInstance | undefined;
    readonly pickable: boolean;
    readonly driver: Driver<DriverProps>;

    constructor(props: LayerProps, readonly ctx: GraphicContext) {
        props.styles = props.styles ?? [];
        const useVertexColors = props.styles.length > 0;
        this.materials = new MaterialLibrary(props, useVertexColors);
        this.api = props.api;
        this.pickable = props.pickable ?? false;
        this.pointInstance = props.pointInstance ? new PointInstance(props.pointInstance) : undefined;
        this.metadata = {};
        this.styles = props.styles.map(s => s.serialize());
        this.driver = this.selectDriver(props);
    }

    async load() {
        if (this.pointInstance)
            await this.pointInstance.load();

        await this.driver.init();
        this.ctx.navigation.positionCameraIfNotSet(this.driver.center);
        this.ctx.navigation.onchange = (target, position) => this.driver.updateView(target, position);  
        this.driver.updateView(this.ctx.navigation.target, this.ctx.navigation.position);
    }

    private selectDriver(props: LayerProps) {
        if (props.api.endsWith('.json'))
            throw Error('GeoJSON API not implemented');
        else
            return new MetacityDriver(props, this);
    }
}
