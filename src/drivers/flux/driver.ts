import axios from "axios";
import * as THREE from "three";
import { Layer } from '../../layer/layer';
import { NetworkData } from "../../workers/flux/dataInterface";
import { Driver, DriverProps } from '../driver';
import { FluxNetwork } from './network';

export interface FluxDriverProps extends DriverProps {
    api: string;
}


export class FluxDriver implements Driver<FluxDriverProps> {
    readonly networkAPI: string;
    readonly metricsAPI: string;
    readonly landuseAPI: string;
    readonly tripsAPI: string;

    private network: FluxNetwork | undefined;
    private center_: THREE.Vector3 | undefined;

    constructor(props: FluxDriverProps, readonly layer: Layer) {
        this.networkAPI = props.api + '/network';
        this.metricsAPI = props.api + '/metrics';
        this.landuseAPI = props.api + '/landuse';
        this.tripsAPI = props.api + '/trips';
    }

    async init() {
        //init center - is supposed to be around 0, 0
        //init network
        this.network = new FluxNetwork(this);
        //init landuse
        //init trips
        //init metrics
    }

    async updateView(target: THREE.Vector3, position: THREE.Vector3) {
        
    }

    get center(): THREE.Vector3 {
        return this.center_ ?? new THREE.Vector3(0, 0, 0);
    }
}