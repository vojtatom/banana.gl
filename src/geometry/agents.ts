import * as THREE from 'three';
import { MaterialLibrary } from '../materials/materials';


const CUBE_GEOMETRY = new THREE.BoxBufferGeometry(10, 10, 10);


class MovementInterval extends THREE.InstancedMesh {
    constructor(attrStart: THREE.InstancedBufferAttribute, attrEnd: THREE.InstancedBufferAttribute, 
                readonly timeStart: number, readonly timeEnd: number, materials: MaterialLibrary) {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(CUBE_GEOMETRY.attributes.position.array, 3));
        geometry.setAttribute('positionStart', attrStart);
        geometry.setAttribute('positionEnd', attrEnd);

        const material = materials.agents;
        super(geometry, material, 1);

        this.frustumCulled = false;
        this.matrixAutoUpdate = false;

        this.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            (material as THREE.ShaderMaterial).uniforms.timeStart.value = timeStart;
            (material as THREE.ShaderMaterial).uniforms.timeEnd.value = timeEnd;
            (material as THREE.ShaderMaterial).uniforms.time.value = scene.userData.time;
            (material as THREE.ShaderMaterial).uniformsNeedUpdate = true;
        }
    }
}

export class InstancedAgentModel extends THREE.Group {
    
    
    constructor(positions: Float32Array[], timeline: number[], materials: MaterialLibrary) {   
        super();

        //construct buffers
        const attrs = [];
        for(let i = 0; i < positions.length; i++) {
            const attribute = new THREE.InstancedBufferAttribute(positions[i], 3, false, 1);
            attrs.push(attribute);
        }

        for (let i = 0; i < positions.length - 1; i++) {
            const movement = new MovementInterval(attrs[i], attrs[i + 1], timeline[i], timeline[i + 1], materials);
            this.add(movement);
        }
    }
}