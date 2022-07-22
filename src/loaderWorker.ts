import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Color, Group, Mesh, BufferGeometry, BufferAttribute, Box3, Points, Object3D } from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LayerType } from './types';

type metadict = {[id: number]: any};


type LoadProps = {
    idOffset: number,
    type: LayerType,
    meta: metadict,
    geom: BufferGeometry[],
}

function getIDBuffer(size: number, id: number) {
    const buffer = new BufferAttribute(new Float32Array(size * 3), 3);
    const color = new Color();
    color.setHex(id);

    for (let i = 0; i < size; i++)
        buffer.setXYZ(i, color.r, color.g, color.b);
    return buffer;
}


function computeInternalMetadata(child: Mesh) {
    const bbox = new Box3();
    bbox.setFromObject(child);
    child.userData.bbox = [bbox.min.toArray(), bbox.max.toArray()];
    child.userData.baseHeight = bbox.min.z;
    child.userData.height = bbox.max.z - bbox.min.z;
}


function loadMesh(mesh: Mesh, props: LoadProps) {
    if (props.type !== LayerType.Mesh && props.type !== LayerType.None) {
        console.error('Mesh layer type mismatch');
        return;
    }
    
    const geometry = mesh.geometry as BufferGeometry;
    const ids = getIDBuffer(geometry.attributes.position.count, props.idOffset);
    geometry.setAttribute('ids', ids);
    
    geometry.computeVertexNormals();
    props.geom.push(geometry);
    
    computeInternalMetadata(mesh);   
    props.meta[props.idOffset++] = mesh.userData;

    mesh.remove();
    props.type = LayerType.Mesh;
}


function loadPoints(points: Points, props: LoadProps) {
    if (props.type !== LayerType.Points && props.type !== LayerType.None) {
        console.error('Points layer type mismatch');
        return;
    }
    
    const geometry = points.geometry as BufferGeometry;
    const ids = getIDBuffer(geometry.attributes.position.count, props.idOffset);
    geometry.setAttribute('ids', ids);
    
    props.meta[props.idOffset++] = points.userData;
    
    props.geom.push(geometry);
    points.remove();
    props.type = LayerType.Points;
}

function loadObject(object: Object3D, props: LoadProps) {
    if (object instanceof Group) {
        object.children.forEach((child) => {
            loadObject(child, props);
        });
    } else if (object instanceof Mesh) {
        loadMesh(object, props);
    } else if (object instanceof Points) {
        loadPoints(object, props);
    } else {
        console.error(`Unknown child type ${object.type}`);
    }

}

function result(geometry: BufferGeometry, metadata: metadict, type: LayerType) {
    return {
        positions: geometry.attributes.position.array,
        normals: geometry.attributes.normal ? geometry.attributes.normal.array : undefined,
        ids: geometry.attributes.ids.array,
        metadata: metadata,
        type: type
    };
}

function preprocess(group: Group, idOffset: number) {
    const props = {
        idOffset: idOffset,
        type: LayerType.None,
        meta: {},
        geom: []
    };

    loadObject(group, props);
    const singleGeometry = mergeBufferGeometries(props.geom);
    return result(singleGeometry, props.meta, props.type);
}

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
//dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
loader.setDRACOLoader( dracoLoader );


function loadModel(message: MessageEvent) {
    
    const { jobID, data } = message.data;
    const { file, idOffset } = data;
    
    const response: any = {
        jobID: jobID
    };
    
    loader.load(file, (gltf) => {
        const result = preprocess(gltf.scene, idOffset);
        response.result = result;
        postMessage(response);
    }, undefined, (error) => {
        console.error(`Could not load tile ${data.file}`);
        console.error(error);
    });
}

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
};



