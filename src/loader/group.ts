import * as THREE from 'three';


export interface ModelGroups {
    points: THREE.Points[], 
    meshes: THREE.Mesh[]
}


export function groupModelsByType(object: THREE.Object3D) : ModelGroups {
    const points: THREE.Points[] = [];
    const meshes: THREE.Mesh[] = [];

    const sort = (object: THREE.Object3D) => {
        if (object instanceof THREE.Group) {
            object.children.forEach(sort);
        } else if (object instanceof THREE.Mesh) {
            meshes.push(object);
        } else if (object instanceof THREE.Points) {
            points.push(object);
        } else {
            console.error(`Unknown child type ${object.type}`);
        }
    }

    sort(object);

    return {
        points,
        meshes
    };
}
