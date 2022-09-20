import axios from 'axios';
import * as THREE from "three";
import { Layer } from '../../layer/layer';
import { Driver, DriverProps } from '../driver';
import { FluxNetwork } from './network';

export interface FluxDriverProps extends DriverProps {
    api: string;
}


export class FluxDriver implements Driver<FluxDriverProps> {
    private networkAPI: string;
    private metricsAPI: string;
    private landuseAPI: string;
    private tripsAPI: string;

    private network: FluxNetwork | undefined;

    constructor(props: FluxDriverProps, layer: Layer) {
        this.networkAPI = props.api + '/network';
        this.metricsAPI = props.api + '/metrics';
        this.landuseAPI = props.api + '/landuse';
        this.tripsAPI = props.api + '/trips';
    }

    async init() {
        //init network
        const network = await axios.get(this.networkAPI);
        this.network = new FluxNetwork(network.data);
        //init landuse
        //init trips
        //init metrics
    }

    async updateView(target: THREE.Vector3, position: THREE.Vector3) {
        
    }

    get center(): THREE.Vector3 {
        //TODO
        return new THREE.Vector3(0, 0, 0);
    }
}