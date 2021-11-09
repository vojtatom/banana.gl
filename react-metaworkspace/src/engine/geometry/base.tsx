import { Renderer } from "../renderer/renderer"
import * as THREE from "three";



export abstract class Model {
    renderer: Renderer;
    mesh: THREE.Mesh | undefined;
    pickingMesh: THREE.Mesh | undefined;
    private visibility: boolean;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.visibility = true;
    }

    set visible(v: boolean) {
        this.visibility = v;
        if (this.mesh) {
            this.mesh.visible = v;
        }
    }

    remove() {
        this.mesh = this.removeFrom(this.mesh, this.renderer.scene);
        this.pickingMesh = this.removeFrom(this.pickingMesh, this.renderer.pickingScene);
    }

    removeFrom(mesh: THREE.Mesh | THREE.LineSegments | undefined, scene: THREE.Scene) {
        if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
        }
        return undefined;
    }
}