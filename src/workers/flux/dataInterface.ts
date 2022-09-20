export interface InputData {
    api: string;
    type: 'network' | 'metrics' | 'landuse' | 'trips';
}

export interface ParsedData {
    //TODO
}

export interface NetworkData {
    apiVersion: string;
    resource: "network";
    data: {
        nodes: {
            [node_id: string]: {
                x: number;
                y: number;
                edges: string[]
            }
        },
        edges: {
            [edge_id: string]: {
                type: string,
                oid: string,
                did: string,
            }
        }
        edgeTypes: {
            [edgeType: string]: {
                speed: number,
                capacity: number,
                sidewalk: boolean,
                color: string,
            }
        }
    }
}