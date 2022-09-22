export interface PointData {
    positions: Float32Array;
    ids?: Float32Array;
}


export interface MeshData {
    positions: Float32Array;
    normals: Float32Array;
    ids: Float32Array;
    colors?: Float32Array;
} 

export interface LineData {
    segmentEndpoints: Float32Array;
    ids: Float32Array;
    zoffset: number;
    thickness: number;
    colors: Float32Array;
}

export interface NodeData {
    positions: Float32Array;
}

export interface AgentData {
    positions: Float32Array[];
    timestamps: Float32Array;
    colors: Float32Array;
}