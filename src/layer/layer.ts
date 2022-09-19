import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from './materials';
import { Driver, DriverProps } from '../drivers/driver';
import { MetacityDriver, MetacityDriverProps } from '../drivers/metacity/driver';
import { MetadataTable } from './metadata';


export interface LayerProps extends MaterialLibraryProps, MetacityDriverProps {
    pickable: boolean;
}

export class Layer {
    readonly materials: MaterialLibrary;
    readonly metadata: MetadataTable;
    readonly pickable: boolean;
    readonly driver: Driver<DriverProps>;

    constructor(props: LayerProps, readonly ctx: GraphicContext) {
        props.styles = props.styles ?? [];
        const useVertexColors = props.styles.length > 0;
        this.materials = new MaterialLibrary(props, useVertexColors);
        this.pickable = props.pickable ?? false;
        this.metadata = {};
        this.driver = this.selectDriver(props);
    }

    async load() {
        await this.driver.init();
        this.ctx.navigation.positionCameraIfNotSet(this.driver.center);
        this.ctx.navigation.onchange = (target, position) => this.driver.updateView(target, position);  
        this.driver.updateView(this.ctx.navigation.target, this.ctx.navigation.position);
    }

    private selectDriver(props: LayerProps) {
        return new MetacityDriver(props, this);
    }
}
