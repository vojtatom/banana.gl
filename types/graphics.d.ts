import * as THREE from 'three';
import { MaterialLibrary } from './material';
import { MapControls } from './controls';
import { Navigation } from './navigation';
import { GPUPicker } from './picker';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
export declare type GraphicsProps = {
    canvas: HTMLCanvasElement;
    background?: number;
};
export declare class Graphics {
    readonly renderer: THREE.WebGLRenderer;
    readonly camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    readonly scene: THREE.Scene;
    readonly controls: MapControls;
    readonly materialLibrary: MaterialLibrary;
    readonly picker: GPUPicker;
    readonly navigation: Navigation;
    private mouseLastDownTime;
    readonly ssao: SSAOPass;
    needsRedraw: boolean;
    onClick: ((x: number, y: number, id: number) => void) | undefined;
    constructor(props: GraphicsProps);
    private updateCameraBoundries;
    get resolution(): THREE.Vector2;
    focus(location: THREE.Vector3, target: THREE.Vector3): void;
}
