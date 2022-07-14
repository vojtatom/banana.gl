import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Color, Group, Mesh, BufferGeometry, BufferAttribute, Box3 } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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

    const flatten = (group: Group) => {
        group.children.forEach((child) => {
            if (child instanceof Group) {
                flatten(child);
            } else if (child instanceof Mesh) {
                const geometry = child.geometry as BufferGeometry;
                
                const colors = getIDBuffer(geometry.attributes.position.count, idOffset);
                
                const bbox = new Box3();
                bbox.setFromObject(child);
                child.userData.bbox = [ bbox.min.toArray(), bbox.max.toArray() ];   
                metadata[idOffset] = child.userData;

                idOffset++;

                geometry.setAttribute('color', colors);
                geometries.push(child.geometry);
                child.remove();
            } else {
                console.error(`Unknown child type ${child.type}`);
            }
        });
    }

    flatten(group);
    const singleGeometry = mergeBufferGeometries(geometries);
    singleGeometry.computeVertexNormals();

    return {
        geometry: singleGeometry, 
        metadata: metadata
        };
}

function loadModel(message: MessageEvent) {
    const loader = new GLTFLoader();

    const data = message.data;
    const response: any = {
        jobID: data.jobID
    };

    loader.load(data.file, (gltf) => {
        const { geometry, metadata } = preprocess(gltf.scene, data.idOffset);
        response.geometry = {
            positions: geometry.attributes.position.array,
            normals: geometry.attributes.normal.array,
            colors: geometry.attributes.color.array,
            metadata: metadata
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



