import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group, Mesh, BufferGeometry, BufferAttribute } from "three";
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function randomColorBuffer(size: number) {
    const buffer = new BufferAttribute(new Float32Array(size * 3), 3);
    const R = Math.random();
    const G = Math.random();
    const B = Math.random();
    for (let i = 0; i < size; i++) {
        buffer.setXYZ(i, R, G, B);
    }
    return buffer;
}

const geometries: BufferGeometry[] = []

function preprocess(group: Group) {
    const geometries: BufferGeometry[] = []

    const flatten = (group: Group) => {
        group.children.forEach((child) => {
            if (child instanceof Group) {
                preprocess(child);
            } else if (child instanceof Mesh) {
                const geometry = child.geometry as BufferGeometry;
                const colors = randomColorBuffer(geometry.attributes.position.count);
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
    return singleGeometry;
}

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    const loader = new GLTFLoader();

    const data = message.data;
    const response: any = {
        jobID: data.jobID
    };

    loader.load(data.file, (gltf) => {
        console.log(gltf.scene);
        const geometry = preprocess(gltf.scene);
        response.geometry = {
            positions: geometry.attributes.position.array,
            normals: geometry.attributes.normal.array,
            colors: geometry.attributes.color.array,
        };
        postMessage(response);

    }, undefined, (error) => {
        console.error(`Could not load tile ${data.file}`);
        console.log(error);
    });
}



