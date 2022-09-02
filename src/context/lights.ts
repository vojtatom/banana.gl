import { GraphicsProps } from "./context";
import * as THREE from "three";


export interface LightProps {
    lightIntensity?: number;
    ambientLightIntensity?: number;
    directionalLightIntensity?: number;
}

export class Lights {
    constructor(props: LightProps, scene: THREE.Scene) {
        props.ambientLightIntensity = props.ambientLightIntensity ?? props.lightIntensity ?? 0.5;
        props.directionalLightIntensity = props.directionalLightIntensity ?? props.lightIntensity ?? 0.5;

        const ambientLight = new THREE.AmbientLight(0xffffff, props.ambientLightIntensity);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, props.directionalLightIntensity);
        directionalLight.position.set(0, 0, 10);
        directionalLight.target.position.set(0, 0, 0);
        scene.add(directionalLight);
    }
}

