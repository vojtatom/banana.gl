import { PolygonalModel, PolygonalProxyModel } from "../geometry/polygons"
import { LineModel, LineProxyModel } from "../geometry/lines"
import { PointModel, PointProxyModel } from "../geometry/points"
import { Tile } from "../datamodel/tile";
import { IModel, IMovement } from "../types";
import { Model } from "./base"
import { Interval } from "../datamodel/interval";
import { Move } from "./movement";


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

export function deserializeMovement(data: IMovement, interval: Interval, callback: CallableFunction, abort: CallableFunction) {
    for (let i = 0; i < data.length; ++i) {
        new Move({ from: data.from[i], to: data.to[i], oid: data.oid[i], time: data.start_time + i, from_speed: data.from_speed[i], to_speed: data.to_speed[i] }, interval, callback, abort);
    }
}