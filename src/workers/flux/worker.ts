import { MessageType } from "../../pools/messageInterface";
import { InputData } from "./dataInterface";
import { loadNetwork } from "./network";

//eslint-disable-next-line no-restricted-globals
self.onmessage = (message: MessageEvent) => {
    loadModel(message);
};


async function loadModel(message: MessageEvent<MessageType<InputData>>) {
    const { jobID, data } = message.data;
    const { api, type } = data;
    
    let result;
    switch (type) {
        case 'network':
            result = await loadNetwork(api);
            break;
        case 'metrics':
            //TODO
            break;
        case 'landuse':
            //TODO
            break;
        case 'trips':
            //TODO
            break;
    }

    postMessage({
        jobID: jobID,
        result
    });

}