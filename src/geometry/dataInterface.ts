export interface PointData {
    positions: Float32Array;
    ids?: Float32Array;
}


export interface MeshData {
    positions: Float32Array;
    normals: Float32Array;
    ids?: Float32Array;
    colors?: Float32Array;
} 

export interface LineData {
    positions: Float32Array;
    colors: Float32Array;
    thickness: number;
    transparency: number;
}

export interface NodeData {
    positions: Float32Array;
}

export interface AgentData {
    positions: Float32Array[];
    timestamps: Float32Array;
    colors: Float32Array;
    size: number;
    zoffset: number;
}