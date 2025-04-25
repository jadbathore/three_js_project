import {RequestMethod,type AppRouter } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import express ,{type Express}  from "express";
import PathUtility from "../CompilerSetUp/Utility/pathUtility.js";
import { optionServer } from "../../server/optionStaticFileExpress.js";
import fs from 'fs'
import https from 'https'
import chalk from "chalk";
import boxen from 'boxen'
import compression from "compression";
import { rollupWatchConfig } from "../CompilerSetUp/Compiler.js";

enum serverStatus {
    connect = "connect",
    disconnect = "disconnect",
    firstConnection = "first connection"
}

export class ServerHandler  {
    private static _socketHandlerInterface:Server.SocketHandler<AppRouter>;
    private static _iteratorAggregate: Server.Aggregator<AppRouter>;

    private _proxy: serverTarget;
    private readonly _target:serverTarget = {
        route:""
    };
    private _subject:LibFile.Subject

    public constructor(
        data:AppRouter[],
        socketHandlerInterface:Server.SocketHandler<AppRouter>,
        subject:LibFile.Subject
    )
    {
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        ServerHandler._socketHandlerInterface = socketHandlerInterface;
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
                if(routeKey  != newvalue){
                    ServerHandler.accessAppRouter(
                        receiver[prop]?.route ?? receiver[prop],
                        ServerHandler._socketHandlerInterface,
                        serverStatus.disconnect,
                        newvalue
                    )
                } else {
                    if((target[prop]?.type) != serverStatus.firstConnection){
                        ServerHandler.accessAppRouter(
                            receiver[prop]?.route ?? receiver[prop],
                            ServerHandler._socketHandlerInterface,
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
        socket:Server.SocketHandler<AppRouter>,
        serverEvent:serverStatus,
    ):void
    private static accessAppRouter(
        targetOld:string,
        socket:Server.SocketHandler<AppRouter>,
        serverEvent:serverStatus,
        targetNew:string
    ):void
    private static accessAppRouter(
        targetOld:string,
        socket:Server.SocketHandler<AppRouter>,
        serverEvent:serverStatus,
        targetNew?:string
    ):void
    {
        switch(serverEvent){
            case serverStatus.connect:
                ServerHandler.handleSocketType(
                    socket.handleConnection,
                    ServerHandler._iteratorAggregate.getItem(targetOld)
                )
            break;
            case serverStatus.disconnect:
                ServerHandler.handleSocketType(
                    socket.handleDeconnection,
                    ServerHandler._iteratorAggregate.getItem(targetOld)
                )
                ServerHandler.handleSocketType(
                    socket.handleConnection,
                    ServerHandler._iteratorAggregate.getItem(targetNew)
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
        const iterator:Server.Iterator<AppRouter> = ServerHandler._iteratorAggregate.getIterator();
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


    public runServer(app:Express) { 
        rollupWatchConfig()
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