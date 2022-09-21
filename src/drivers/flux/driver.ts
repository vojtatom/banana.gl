import axios from "axios";
import * as THREE from "three";
import { Layer } from '../../layer/layer';
import { NetworkData } from "../../workers/flux/dataInterface";
import { Driver, DriverProps } from '../driver';
import { FluxLandUse } from "./landuse";
import { FluxNetwork } from './network';
import { FluxPopulation } from "./population";

export interface FluxDriverProps extends DriverProps {
    api: string | string[];
    driverType: "network" | "landuse" | "population";
}


export class FluxDriver implements Driver<FluxDriverProps> {
    readonly api: string | string[];
    private subdriver: FluxNetwork | FluxLandUse | FluxPopulation | undefined;
    private subtype: string;
    private center_: THREE.Vector3 | undefined;

    constructor(props: FluxDriverProps, readonly layer: Layer) {
        this.api = props.api;
        this.subtype = props.driverType;
    }

    async init() {
        this.center_ = new THREE.Vector3(0, 0, 0);

        switch (this.subtype) {
            case "network":
                this.subdriver = new FluxNetwork(this);
                break;
            case "landuse":
                this.subdriver = new FluxLandUse(this);
                break;
            case "population":
                this.subdriver = new FluxPopulation(this);
                break;
            default:
                throw new Error("Unknown driver type: " + this.subtype);
        }
    }

    async updateView(target: THREE.Vector3, position: THREE.Vector3) {
        //TODO
    }

    get center(): THREE.Vector3 {
        return this.center_ ?? new THREE.Vector3(0, 0, 0);
    }
}