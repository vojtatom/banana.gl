export interface PointData {
    positions: Float32Array;
    ids: Float32Array;
}


export interface MeshData {
    positions: Float32Array;
    normals: Float32Array;
    ids: Float32Array;
    colors?: Float32Array;
} 

export interface LineData {
    segmentEndpoints: Float32Array;
    offset: number;
    width: number;
}