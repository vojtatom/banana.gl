import { GraphicContext } from '../context/context';
import { MaterialLibrary, MaterialLibraryProps } from '../materials/materials';
import { Driver, DriverProps } from '../drivers/driver';
import { MetacityDriver, MetacityDriverProps } from '../drivers/metacity/driver';
import { FluxDriver, FluxDriverProps } from '../drivers/flux/driver';
import { MetadataTable } from './metadata';


export interface LayerProps extends MaterialLibraryProps, MetacityDriverProps, FluxDriverProps {
    type: 'metacity' | 'flux';
    pickable: boolean;
}

export class Layer {
    readonly materials: MaterialLibrary;
    readonly metadata: MetadataTable;
    readonly pickable: boolean;
    readonly driver: Driver<DriverProps>;

    constructor(props: LayerProps, readonly ctx: GraphicContext) {
        props.styles = props.styles ?? [];
        const useVertexColors = props.styles.length > 0 || props.type === 'flux';
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
        switch (props.type) {
            case 'metacity':
                return new MetacityDriver(props, this);
            case 'flux':
                return new FluxDriver(props, this);
            default:
                throw new Error(`Unknown layer type: ${props.type}`);
        }
    }
}
