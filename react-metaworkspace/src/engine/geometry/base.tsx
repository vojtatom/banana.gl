import { Renderer } from "../renderer/renderer"
import * as THREE from "three";
import { color, color_default, LayerStyle } from "../renderer/style";


export enum OIDType {
    source,
    target,
    object
}

export class Model {
    renderer: Renderer;
    mesh?: THREE.Mesh;
    pickingMesh?: THREE.Mesh;
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
        if (this.pickingMesh) {
            this.pickingMesh.visible = v;
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

    baseColors(threeVertLength: number) {
        const colors = new Uint8Array(threeVertLength);
        for (let i = 0; i < threeVertLength; i++)
            colors[i] = 255;
        return colors;
    }

    afterApplyStyle() {
        this.renderer.status.actions.applyingStyles.stop();
        if (this.mesh)
        {
            this.mesh.geometry.attributes.color.needsUpdate = true;
            this.renderer.changed = true;
        }
    }

    applyStyle(offset: number, style?: LayerStyle, type?: OIDType) {
        if (!this.mesh || !this.mesh.geometry.attributes.objectID)
            return;

        this.renderer.status.actions.applyingStyles.start();
        const oids = this.mesh.geometry.attributes.objectID.array;
        const out = this.mesh.geometry.attributes.color.array;

        if (style) {
            color(offset, oids as Uint8Array, style.color_buffer, out, this.afterApplyStyle.bind(this));
        } else {
            color_default(oids.length, out, this.afterApplyStyle.bind(this));
        }
    }

}

export class ModelProxy extends Model {
    applyStyle(offset: number, style?: LayerStyle, type: OIDType = OIDType.source) {
        if (!this.mesh || !this.mesh.geometry.attributes.objectID)
            return;

        this.renderer.status.actions.applyingStyles.start();
        const oids = this.mesh.geometry.attributes.objectID.array;
        const out = this.mesh.geometry.attributes.color.array;

        if (style) {
            if (type === OIDType.source)
                color(offset, oids as Uint8Array, style.color_buffer_source, out, this.afterApplyStyle.bind(this))
            else
                color(offset, oids as Uint8Array, style.color_buffer_target, out, this.afterApplyStyle.bind(this))
        } else {
            color_default(oids.length, out, this.afterApplyStyle.bind(this));
        }
    }
}

