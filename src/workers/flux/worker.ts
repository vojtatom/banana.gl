import { MessageType } from "../../pools/messageInterface";
import { InputData } from "./dataInterface";
import { loadLandUse } from "./landuse";
import { loadNetwork } from "./network";
import { loadPopulation } from "./population";

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
            result = await loadNetwork(api as string);
            break;
        case 'landuse':
            result = await loadLandUse(api as string);
            break;
        case 'population':
            result = await loadPopulation(api as string[]);
            break;
    }

    postMessage({
        jobID: jobID,
        result
    });

}