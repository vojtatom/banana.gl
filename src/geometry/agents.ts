import * as THREE from 'three';
import { MaterialLibrary } from '../materials/materials';
import { AgentData } from './dataInterface';


class MovementInterval extends THREE.InstancedMesh {
    constructor(attrStart: THREE.InstancedBufferAttribute, attrEnd: THREE.InstancedBufferAttribute, 
                readonly timeStart: number, readonly timeEnd: number, 
                instance: THREE.BufferGeometry, shift: number,
                colors: THREE.InstancedBufferAttribute, materials: MaterialLibrary) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(instance.attributes.position.array, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(instance.attributes.normal.array, 3));
        geometry.setAttribute('color', colors);
        geometry.setAttribute('positionStart', attrStart);
        geometry.setAttribute('positionEnd', attrEnd);

        const material = materials.agents;
        super(geometry, material, attrStart.count);

        this.frustumCulled = false;
        this.matrixAutoUpdate = false;

        material.uniforms.shift.value = shift;
        this.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            (material as THREE.ShaderMaterial).uniforms.timeStart.value = timeStart;
            (material as THREE.ShaderMaterial).uniforms.timeEnd.value = timeEnd;
            (material as THREE.ShaderMaterial).uniforms.time.value = scene.userData.time;
            (material as THREE.ShaderMaterial).uniformsNeedUpdate = true;
        }
    }

    updateVisibility(time: number) {
        this.visible = time > this.timeStart && time < this.timeEnd;
    }
}

export class InstancedAgentModel extends THREE.Group {
    constructor(data: AgentData, materials: MaterialLibrary) {   
        super();

        const instance = new THREE.BoxBufferGeometry(data.size * 1.5, data.size, data.size).toNonIndexed();
        instance.translate(0, 0, data.zoffset);

        const attrs = [];
        for(let i = 0; i < data.positions.length; i++) {
            const attribute = new THREE.InstancedBufferAttribute(data.positions[i], 3, false, 1);
            attrs.push(attribute);
        }

        console.log(attrs.length);

        const colors = new THREE.InstancedBufferAttribute(data.colors, 3, false, 1);

        for (let i = 0; i < data.positions.length - 1; i++) {
            const movement = new MovementInterval(
                attrs[i], attrs[i + 1], data.timestamps[i], 
                data.timestamps[i + 1], instance, data.size * 0.5, colors, materials);
            this.add(movement);
        }
    }

    updateVisibility(time: number) {
        //this.children.forEach(child => {
        //    (child as MovementInterval).updateVisibility(time);
        //});
    }
}