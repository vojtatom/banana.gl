import { PolygonalModel } from "../geometry/polygons"
import { LineModel, LineProxyModel } from "../geometry/lines"
import { Tile } from "../datamodel/tile";
import { IModel } from "../types";
import { Model } from "./base"


const registeredModels: {[name: string]: {[name: string]: new(data: IModel, tile: Tile) => Model }} = {
    model: {
        simplepolygon: PolygonalModel,
        simpleline: LineModel,
    },
    proxy: {
        simpleline: LineProxyModel,
    }
};

const modelTypes = Object.keys(registeredModels.model);
const proxyTypes = Object.keys(registeredModels.proxy);


export function deserializeModel(data: IModel, tile: Tile) {
    if (data.tags && data.tags.proxy === true) {
        if (proxyTypes.includes(data.type)) 
            return new (registeredModels.proxy[data.type])(data, tile);
        throw new Error(`Proxy type ${data.type} is not registered`);
    } else {
        if (modelTypes.includes(data.type))
            return new registeredModels.model[data.type](data, tile);
        throw new Error(`Model type ${data.type} is not registered`);
    }
}
