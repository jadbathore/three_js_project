import express ,{type Express,type IRouter,type Router}  from "express";
import fs from 'fs' 
import https from 'https'
import { createServer } from "node:http";
import compression from 'compression';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import  { RequestMethod,type AppRouter}  from "../../route/routeur.js"
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import { optionServer } from '../../server/optionStaticFileExpress.js';
import { CompilerWatchSubject,ObserverWatch,proxyObserver,proxyRevokeCall } from '../oberserver/oberserver.js';
import { Compiler,rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
import {Server as ioServer} from 'socket.io'
import { createAdapter } from "@socket.io/redis-adapter"
import {createClient} from "redis"
import chalk from "chalk";
import boxen from "boxen";

enum serverStatus {
    connect = "connect",
    disconnect = "disconnect",
}


export class Context {
    private _strategy: Server.Strategy;
    private _subject:CompilerWatchSubject;  
    private _serverEvent:EventServer<serverStatus>[] = [];
    private readonly _proxyHandler:ProxyHandler<EventServer<serverStatus>[]>
    private _proxy:any;

    constructor(strategy: Server.Strategy) {
        this._strategy = strategy;
        this._subject = new CompilerWatchSubject();
        this._proxyHandler = this.setServerEventProxy();
        this.setProxy()
    }

    public setStrategy(strategy: Server.Strategy) {
        this._strategy = strategy;
    }

    public runServer(): void {
        rollupWatchConfig()
        const app:Express = express()
        app.use(compression());
        app.use(connectLiveReload())
        app.set('view engine','ejs')
        app.set('views',PathUtility.getViewerFile())
        app.use(express.static('app/public',optionServer))
        const key:Buffer|null = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
        const cert:Buffer|null = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
        const server = (key && cert)? https.createServer({key: key, cert: cert }, app):createServer(app);
        const pubClient = createClient({url:"redis://lacalhost:6379"})
        const subClient = pubClient.duplicate();
        const io = new ioServer(server)
        io.adapter(createAdapter(pubClient,subClient))
        const port = process.env.EXPRESS_PORT || 3004;
        this.serverWatcher(app)
        this._strategy.doAlgorithm(app,this._subject,this._proxy);
        server.listen(port,()=>{
            console.log(chalk.greenBright(
                boxen(`Server is running on port : ${port}`,
                {
                    padding: 1,
                })
            ))
        }) 
    }

    private setServerEventProxy():ProxyHandler<EventServer<serverStatus>[]>{
        return {
            get:function(target:EventServer<serverStatus>[], p:string, receiver:any)
            {
                if(p){
                    const index:number = parseInt(p)
                    return target[index]
                }
                return target
            },
            set:function(target:EventServer<serverStatus>[],p:string,newvalue:any,receiver:any):boolean{
                const index:number = parseInt(p)
                target[index] = newvalue
                return true
            }
        }
    }

    private setProxy():void {
        const _array:EventServer<serverStatus>[] = []
        const proxyServerEvent:EventServer<serverStatus>[] = new Proxy<EventServer<serverStatus>[]>(this._serverEvent,this._proxyHandler)
        Object.defineProperty(proxyServerEvent,'push', 
            {
                value: function():void
                {
                    const EventServer:EventServer<serverStatus> = {route:arguments[0],type:serverStatus.connect}
                    if(EventServer)
                    _array.push(EventServer)
                },
                writable: true,
                configurable: true
        })
        this._proxy = _array
    }

    public serverWatcher(app:Express){
        app.use((req,res,next)=>{
            this._proxy.push(req.path)
            next();
        })
    }
}

export class ServerStrategy implements Server.Strategy {
    private _data:AppRouter[];
    private _compilerArray:Compiler[] = []

    constructor(data:AppRouter[]){
        this._data = data;
    }

    public doAlgorithm(app:Express,subject:LibFile.Subject,test:Array<string>):void {
        const collection:Server.Aggregator<AppRouter> = new ServerRouteAggregate(this._data);
        const iterator:Server.Iterator<AppRouter> = collection.getIterator();
        while (iterator.valid()) {
            const routeObj:AppRouter = iterator.next();
            if(routeObj.method != RequestMethod.middleWare){
                if(routeObj.scene){
                    const oberserver:LibFile.Observer = new ObserverWatch(routeObj.pathServer)
                    const compiler:Compiler = new Compiler(oberserver,subject,routeObj.scene)
                    compiler.compile()
                    // proxyObserver(oberserver,(event,path,proxy)=>{
                    //     console.log(event)
                    //     if(event.filename == "3.cameraSetting.js")
                    //         {
                    //             subject.detach(oberserver)
                    //             compiler.DestructCompiler();
                    //             proxyRevokeCall(proxy,oberserver).revoke();
                    //         }    
                    // })
                }
                // io.on("disconnect", (socket) => {console.log("deconnect")
                //     this.compiler
                // })
                app[routeObj.method](routeObj.pathServer,routeObj.serverLogic);
            } else {
                app[routeObj.method](routeObj.serverLogic);
            }
        }
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


