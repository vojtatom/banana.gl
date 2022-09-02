
export interface MessageType<InputType> {
    jobID: number;
    data: InputType;
}

export interface OutputType<ResultType> {
    jobID: number;
    result: ResultType;
}
