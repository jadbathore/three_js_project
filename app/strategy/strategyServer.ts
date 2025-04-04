import type { Express, IRouter } from "express";
import express  from "express";
import fs from 'fs' 
import https from 'https'
import compression from 'compression';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import type { AppRouter } from "../route/routeur.js"
// import  { RequestMethod, router} from "../route/routeur.js"
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import { optionServer } from '../server/optionStaticFileExpress.js';
import { CompilerWatchSubject,ObserverWatch,ProxyObserver } from '../oberserver/oberserver.js';
import { compiler,rollupWatchConfig } from "../CompilerSetUp/Compiler.js";

export class Context {
    private _strategy: Server.Strategy;
    private _subject:CompilerWatchSubject;  

    constructor(strategy: Server.Strategy) {
        this._strategy = strategy;
        this._subject = new CompilerWatchSubject()

    }

    public setStrategy(strategy: Server.Strategy) {
        this._strategy = strategy;
    }

    public runServer(): void {
        const app:Express = express()
        app.use(compression());
        app.use(connectLiveReload())
        app.set('view engine','ejs')
        app.set('views',PathUtility.getViewerFile())
        app.use(express.static('app/public',optionServer))
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
    private _data:AppRouter[];

    constructor(data:AppRouter[]){
        this._data = data;
    }

    public doAlgorithm(app:Express):void {
        const collection:Server.Aggregator<AppRouter> = new ServerRouteAggregate(this._data);
        const iterator:Server.Iterator<AppRouter> = collection.getIterator();
        while (iterator.valid()) {
            const routeObj:AppRouter = iterator.next();
            const ExpressRouter = express.Router()
            if(routeObj.method != RequestMethod.middleWare){
                if(routeObj.scene){
                    const oberserver:LibFile.Observer = new ObserverWatch(routeObj.pathServer)
                }
                ExpressRouter[routeObj.method](routeObj.pathServer,routeObj.serverLogic);
            } else {
                ExpressRouter[routeObj.method](routeObj.serverLogic);
            }
        }
            app.use([])
    }
}


// const port = process.env.EXPRESS_PORT || 3000;
// const liveReloadServer = livereload.createServer();
// app.use(compression())
// app.set('view engine','ejs')
// app.set('views',PathUtility.getViewerFile())
// app.use(express.static('app/public',optionServer))

// async function callCompiler(subject,oberserver)
// {
//     const {compiler} =  await import('../CompilerSetUp/Compiler.js')
//     return compiler(subject,oberserver)
// }

// app.use(connectLiveReload())




/**
 * The client code picks a concrete strategy and passes it to the context. The
 * client should be aware of the differences between strategies in order to make
 * the right choice.
 */


