export interface InputData {
    api: string | string[];
    type: 'network' | 'metrics' | 'landuse' | 'population';
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

export interface LandUseData {
    apiVersion: string;
    resource: "landuse";
    data: {
        [area_id: string]: {
            area: number,
            boundary: {
                x: number,
                y: number,
            }[],
            color: string,
            population: number,
            tiles: {
                rotation: number,
                x: number,
                y: number,
                width: number,
            }[],
            use: string,
        },
    }
}

export interface PopulationData {
    apiVersion: string;
    resource: "population";
    data: {
        agents: {
            [agent_id: string]: {
                movements: {
                    tf: number;
                    ti: number;
                    oid: string;
                    did: string;
                }[],
                oid: string,
                type: string,
            }
        },
        agentTypes: {
            [agentType: string]: {
                color: string
            }
        }
    }
}

export interface PerformanceData {
    apiVersion: string;
    resource: "performance";
    data: {
        counts : {
            [edge_id: string]: {
                [mode: string]: number
            }
        },
        bargraphs: {
            xAxis: string;
            yAxis: string;
            title: string;
            bars: [
                {
                    xValue: string;
                    yValue: number;
                }
            ]
        },
        metrics: {
            label: string;
            units: string;
            value: number;
        }
    }
}


