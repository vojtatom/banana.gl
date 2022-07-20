import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Color, Group, Mesh, BufferGeometry, BufferAttribute, Box3, Points } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LayerType } from "./types";

function getIDBuffer(size: number, id: number) {
    const buffer = new BufferAttribute(new Float32Array(size * 3), 3);
    let color = new Color();
    color.setHex(id);

    for (let i = 0; i < size; i++)
        buffer.setXYZ(i, color.r, color.g, color.b);
    return buffer;
}

function preprocess(group: Group, idOffset: number) {
    const geometries: BufferGeometry[] = []
    const metadata: {[id: number]: any} = {};
    let type: LayerType = LayerType.None;

    let flatten = (group: Group) => {
        group.children.forEach((child) => {
            if (child instanceof Group) {
                flatten(child);
            } else if (child instanceof Mesh) {
                const geometry = child.geometry as BufferGeometry;
                const ids = getIDBuffer(geometry.attributes.position.count, idOffset);
                geometry.setAttribute('ids', ids);
                geometries.push(child.geometry);
                geometry.computeVertexNormals();
                
                computeInternalMetadata(child);   
                metadata[idOffset++] = child.userData;

                child.remove();
                type = LayerType.Mesh;

            } else if (child instanceof Points) {
                const geometry = child.geometry as BufferGeometry;
                const ids = getIDBuffer(geometry.attributes.position.count, idOffset);
                geometry.setAttribute('ids', ids);
                geometries.push(child.geometry);
                
                metadata[idOffset++] = child.userData;

                child.remove();
                type = LayerType.Points;
            } else {
                console.error(`Unknown child type ${child.type}`);
            }
        });
    }

    flatten(group);

    const singleGeometry = mergeBufferGeometries(geometries);

    return {
        geometry: singleGeometry, 
        metadata: metadata,
        type: type
        };
}

function computeInternalMetadata(child: Mesh<any, any>) {
    const bbox = new Box3();
    bbox.setFromObject(child);
    child.userData.bbox = [bbox.min.toArray(), bbox.max.toArray()];
    child.userData.baseHeight = bbox.min.z;
    child.userData.height = bbox.max.z - bbox.min.z;
}

function loadModel(message: MessageEvent) {
    
    const { jobID, data } = message.data;
    const { file, idOffset } = data;
    
    const response: any = {
        jobID: jobID
    };
    
    const loader = new GLTFLoader();
    loader.load(file, (gltf) => {
        const { geometry, metadata, type } = preprocess(gltf.scene, idOffset);
        response.result = {
            positions: geometry.attributes.position.array,
            normals: geometry.attributes.normal ? geometry.attributes.normal.array : undefined,
            ids: geometry.attributes.ids.array,
            metadata: metadata,
            type: type
        };
        postMessage(response);

    }, undefined, (error) => {
        console.error(`Could not load tile ${data.file}`);
        console.error(error);
    });
}

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
}



