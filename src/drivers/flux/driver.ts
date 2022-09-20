import axios from 'axios';
import * as THREE from "three";
import { Layer } from '../../layer/layer';
import { Driver, DriverProps } from '../driver';

export interface FluxDriverProps extends DriverProps {
    api: string;
}


export class FluxDriver implements Driver<FluxDriverProps> {
    private networkAPI: string;
    private metricsAPI: string;
    private landuseAPI: string;
    private tripsAPI: string;


    constructor(props: FluxDriverProps, layer: Layer) {
        this.networkAPI = props.api + '/network';
        this.metricsAPI = props.api + '/metrics';
        this.landuseAPI = props.api + '/landuse';
        this.tripsAPI = props.api + '/trips';
    }

    async init() {

    }

    async updateView(target: THREE.Vector3, position: THREE.Vector3) {
        
    }

    get center(): THREE.Vector3 {
        return null;
    }
}