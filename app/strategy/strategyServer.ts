import type { route} from "../route/routeur.js"
import  { RequestMethod} from "../route/routeur.js"
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import type { Express } from "express";
import express  from "express";
import fs from 'fs' 
import https from 'https'
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';

export class Context {
    private _strategy: Server.Strategy;

    constructor(strategy: Server.Strategy) {
        this._strategy = strategy;
    }

    public setStrategy(strategy: Server.Strategy) {
        this._strategy = strategy;
    }

    public runServer(): void {
        const app:Express = express()
        const key:Buffer|null = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
        const cert:Buffer|null = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
        const server:Express|https.Server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;
        const port = process.env.EXPRESS_PORT || 3004;
        this._strategy.doAlgorithm(app);
        server.listen(port,()=>{
            console.log(`server running on port : ${port}`)
        })
    }
}

export class ServerStrategy implements Server.Strategy {
    private _data:route[];

    constructor(data:route[]){
        this._data = data;
    }

    public doAlgorithm(app:Express): void {
        const collection:Server.Aggregator<route> = new ServerRouteAggregate(this._data);
        const iterator:Server.Iterator<route> = collection.getIterator();
        while (iterator.valid()) {
            const routeObj:route = iterator.next();
            if(routeObj.method != RequestMethod.middleWare){
                if(routeObj.scene){
                    
                }
                app[routeObj.method](routeObj.pathServer,routeObj.serverLogic);
            } else {
                app[routeObj.method](routeObj.serverLogic);
            }
        }
    }
}


/**
 * The client code picks a concrete strategy and passes it to the context. The
 * client should be aware of the differences between strategies in order to make
 * the right choice.
 */


