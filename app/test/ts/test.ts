import express ,{Handler, type Express,type IRouter,type Router}  from "express";
import fs from 'fs';
import https from 'https'
import compression from "compression";
import chalk from "chalk";
import boxen from "boxen";
import {RequestMethod,router,type AppRouter } from "../../route/routeur.js"
import { ServerRouteAggregate } from "../../model/iterator/iteratorServer.js";
import PathUtility from "../../model/CompilerSetUp/Utility/pathUtility.js";
import { optionServer } from "../../server/optionStaticFileExpress.js";
import { CompilerWatchSubject, proxyObserver } from "../../model/oberserver/oberserver.js";
import { connection, Connection } from "mongoose";
import { Compiler } from "../../model/CompilerSetUp/Compiler.js";


type serverTarget = {
    route:string,
}

enum serverStatus {
    connect = "connect",
    disconnect = "disconnect",
    firstConnection = "first connection"
}


interface SocketHandler {
    handleConnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void;
    handleDeconnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void;
}

class Socket implements SocketHandler {

    public handleConnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void
    {
        compiler.compile()
        proxyObserver(oberserver,(event,path,proxy)=>{
            console.log(event,path,proxy)
        })
    }

    public handleDeconnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void
    {
        compiler.DestructCompiler()
    }
}

class TestServer {
    private static _socketHandlerInterface:SocketHandler;
    private static _iteratorAggregate: Server.Aggregator<AppRouter>;

    private _proxy: serverTarget;
    private readonly _target:serverTarget = {
        route:""
    };
    private _subject:LibFile.Subject

    public constructor(
        data:AppRouter[],
        socketHandlerInterface:SocketHandler,
        subject:LibFile.Subject
    )
    {
        TestServer._iteratorAggregate = new ServerRouteAggregate(data);
        TestServer._socketHandlerInterface = socketHandlerInterface;
        this._proxy = new Proxy(this._target,this.serverProxyHandler());
        this._subject = subject
    }

    private serverProxyHandler():ProxyHandler<serverTarget>
    {
        return {
            get:function(target:any, prop:keyof serverTarget):serverTarget|EventServer<serverStatus>
                {
                    if(prop){
                        return target[prop]
                    }
                    return target
            },
            set:function(target:any,prop:keyof serverTarget,newvalue:any,receiver:any)
            {
                const routeKey = receiver[prop]?.route ?? receiver[prop];
                const routeType = (receiver[prop].route)? serverStatus.connect:serverStatus.firstConnection
                console.log(routeKey,newvalue,routeType)
                if(routeKey  != newvalue){
                    TestServer.accessAppRouter(
                        receiver[prop]?.route ?? receiver[prop],
                        TestServer._socketHandlerInterface,
                        serverStatus.disconnect,
                        newvalue
                    )
                } else {
                    if((target[prop]?.type) != serverStatus.firstConnection){
                        TestServer.accessAppRouter(
                            receiver[prop]?.route ?? receiver[prop],
                            TestServer._socketHandlerInterface,
                            routeType,
                        )
                    }
                }
                target[prop] = {
                    route:newvalue,
                    type:routeType
                }
                return true;
            }
        }
    }

    private static accessAppRouter(
        targetOld:string,
        socket:SocketHandler,
        serverEvent:serverStatus,
    ):void
    private static accessAppRouter(
        targetOld:string,
        socket:SocketHandler,
        serverEvent:serverStatus,
        targetNew:string
    ):void
    private static accessAppRouter(
        targetOld:string,
        socket:SocketHandler,
        serverEvent:serverStatus,
        targetNew?:string
    ):void
    {
        switch(serverEvent){
            case serverStatus.connect:
                TestServer.handleSocketType(
                    socket.handleConnection,
                    TestServer._iteratorAggregate.getItem(targetOld)
                )
            break;
            case serverStatus.disconnect:
                TestServer.handleSocketType(
                    socket.handleDeconnection,
                    TestServer._iteratorAggregate.getItem(targetOld)
                )
                TestServer.handleSocketType(
                    socket.handleConnection,
                    TestServer._iteratorAggregate.getItem(targetNew)
                )
            break;
            case serverStatus.firstConnection:break;
            default:throw new Error(`unknow type:"${serverEvent}"`)
        }
    }

    private static handleSocketType(callback:(appRouter:AppRouter)=>void):void 
    private static handleSocketType(callback:(appRouter:AppRouter)=>void,item:AppRouter):void 
    private static handleSocketType(callback:(appRouter:AppRouter)=>void,item?:AppRouter):void 
    {
        if(item?.CompilerTuple ?? false){
            callback(item)
        }
    }


    private createRoute(app:Express){
        const iterator:Server.Iterator<AppRouter> = TestServer._iteratorAggregate.getIterator();
        do {
            const routeObj:AppRouter = iterator.current();
            if(routeObj.method != RequestMethod.middleWare){
                if(fs.existsSync(routeObj.scene)){
                    iterator.addCompilerTuple(this._subject);
                }
                app[routeObj.method](routeObj.pathServer,routeObj.serverLogic);
            } else {
                app[routeObj.method](routeObj.serverLogic);
            }
        } while (iterator.valid()) 
    }

    private serverWatcher(app:Express){
        app.use((req,res,next)=>{
            this._proxy.route = req.path;
            console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`))
            next();
        })
    }

    private async *test(res:express.Response<any, Record<string, any>>){

    }

    public runServer(app:Express) { 
        app.use(compression());
        app.set('view engine','ejs')
        app.set('views',PathUtility.getViewerFile())
        app.use(express.static('app/public',optionServer))
        const key:Buffer|null = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
        const cert:Buffer|null = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
        const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;
        const port = process.env.EXPRESS_PORT || 3004;
        this.serverWatcher(app);
        this.createRoute(app);
        server.listen(port,()=>{
            console.log(chalk.greenBright(
                boxen(`Server is running on port : ${port}`,
                {
                    padding: 1,
                })
            ))
        })
    }


}
const z = new Socket();
const s = new CompilerWatchSubject()
const Tser = new TestServer(router,z,s)
const app = express()
Tser.runServer(app)