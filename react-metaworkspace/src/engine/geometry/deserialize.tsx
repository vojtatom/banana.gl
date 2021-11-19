import { PolygonalModel, PolygonalProxyModel } from "../geometry/polygons"
import { LineModel, LineProxyModel } from "../geometry/lines"
import { PointModel, PointProxyModel } from "../geometry/points"
import { Tile } from "../datamodel/tile";
import { IModel } from "../types";
import { Model } from "./base"


const registeredModels: {[name: string]: {[name: string]: new(data: IModel, tile: Tile, callback: CallableFunction, abort: CallableFunction) => Model }} = {
    model: {
        simplepolygon: PolygonalModel,
        simpleline: LineModel,
        simplepoint: PointModel,
    },
    proxy: {
        simpleline: LineProxyModel,
        simplepolygon: PolygonalProxyModel,
        simplepoint: PointProxyModel,
    }
};

const modelTypes = Object.keys(registeredModels.model);
const proxyTypes = Object.keys(registeredModels.proxy);


export function deserializeModel(data: IModel, tile: Tile, callback: CallableFunction = () => {}, abort: CallableFunction = () => false) {
    if (data.tags && data.tags.proxy === true) {
        if (proxyTypes.includes(data.type)) 
            return new (registeredModels.proxy[data.type])(data, tile, callback, abort);
        throw new Error(`Proxy type ${data.type} is not registered`);
    } else {
        if (modelTypes.includes(data.type))
            return new registeredModels.model[data.type](data, tile, callback, abort);
        throw new Error(`Model type ${data.type} is not registered`);
    }
}
