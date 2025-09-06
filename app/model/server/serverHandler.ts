import {RequestMethod,type AppRouter } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import express ,{ NextFunction, response, type Express }  from "express";
import PathUtility from "../CompilerSetUp/Utility/pathUtility.js";
import { optionServer } from "../../server/optionStaticFileExpress.js";
import fs from 'fs'
import { createClient, RedisClientType } from 'redis'
import https from 'https'
import chalk from "chalk";
import boxen from 'boxen'
import compression from "compression";
import { rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
import http from "http"

import { DataParser, RequestParser, ResponseParser } from "./headParser.js";
import { Socket } from "dgram";
import { SocketTree, TLSServerSingleTone } from "./client.js";
import type {CallBackSimpleSocket, CallBackSimpleSocketData,httpsServerArgs,SimpleSocketImplementTupleData,SimpleSocketImplementTuple,Simple} from "./client.js";
import internal from "stream";
import { SocketImplement } from "../../server/serverHandler/socketImplement.js";
import { responseHandler } from "./headHandler.js";
import { TLSSocket } from "tls";


enum serverStatus {
    connect = "connect",
    disconnect = "disconnect",
    firstConnection = "first connection"
}

export class ServerHandler
{
    private static _socketHandlerInterface:Server.SocketHandler<AppRouter>;
    private static _iteratorAggregate: Server.Aggregator<AppRouter>;

    private _server:http.Server|TLSServerSingleTone;
    private _app:Express;
    private static _proxy: Server.serverTarget|any;
    private _redisClient?:RedisClientType<any,any,any>
    private _port:Server.Port

    private readonly _target:Server.serverTarget = {
        route:""
    };

    private _subject:LibFile.Subject
    public constructor(
        data:AppRouter[],
        subject:LibFile.Subject,
        app:Express,
        port:number
    )
    {
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        rollupWatchConfig()
        this.setRedisclient();
        this._subject = subject;
        ServerHandler._proxy = new Proxy(this._target,this.serverProxyHandler());
        this._port = (this.fourdigitPort(port))? port : 1000 as Server.Port;
        this._app = this.setApp(app)
        this._server = this.setServer(this._app);
        this.upgradeServeur()
    }



    private  setRedisclient(){
        (async ()=>{
            try {
                this._redisClient = await createClient({url:process.env.REDIS_URL})
                .on('error',(error:any)=>{
                    throw error;
                })
                .on('connect',()=>{
                    console.log(chalk.keyword('lightgreen')('redis client connected'))
                })
                .connect();
            } catch (e) {
                console.log((e instanceof AggregateError)?chalk.yellow('redis is not connected you could use docker to have it.'):chalk.red('redis client err :',e));
                this._redisClient = null;
            } 
        })()
    }


    private fourdigitPort(value:number):value is Server.Port {
        return Number.isInteger(value) && value >= 1000 && value <= 9999
    }



    private serverProxyHandler():ProxyHandler<Server.serverTarget>
    {
        return {
            get:function(target:any, prop:keyof Server.serverTarget):Server.serverTarget|Server.EventServer<serverStatus>
            {
                if(prop){
                    return target[prop]
                }
                return target
            },
            set:function(target:any,prop:keyof Server.serverTarget,newvalue:string,receiver:any)
            {
                const {route:oldRoute,type:oldType}:Server.EventServer<serverStatus> = target;
                target['route'] = newvalue;
                if(ServerHandler._socketHandlerInterface) {
                    let currentStatus:serverStatus;
                    switch(true){
                        case (typeof oldType == 'undefined'):
                            currentStatus = serverStatus.firstConnection
                            ServerHandler.accessAppRouterHandle(newvalue,ServerHandler._socketHandlerInterface)
                        break;
                        case (oldRoute != newvalue):
                            currentStatus = serverStatus.disconnect
                            ServerHandler.accessAppRouterHandle(newvalue,ServerHandler._socketHandlerInterface,oldRoute)
                        break;
                        default:  
                            currentStatus = serverStatus.connect
                    }
                    target['type'] = currentStatus
                }
                return true 
            }
        }
    }

    private static accessAppRouterHandle(nextTarget:string,socket:Server.SocketHandler<AppRouter>,currentTarget:string):void
    private static accessAppRouterHandle(nextTarget:string,socket:Server.SocketHandler<AppRouter>):void
    private static accessAppRouterHandle(nextTarget:string,socket:Server.SocketHandler<AppRouter>,currentTarget?:string):void
    {
        if(currentTarget){
            const appRouterCurrent:AppRouter = ServerHandler._iteratorAggregate.getItem(currentTarget);
            this.handleSocketType(socket.handleDeconnection,appRouterCurrent);
        }
        const appRouterNext:AppRouter = ServerHandler._iteratorAggregate.getItem(nextTarget);
        this.handleSocketType(socket.handleReconnection,appRouterNext);
        this.handleSocketType(socket.handleConnection,appRouterNext);
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
                app[routeObj.method](routeObj.pathServer,routeObj.serverLogic);
            } else {
                app[routeObj.method](routeObj.serverLogic);
            }
        } while (iterator.valid()) 
    }

    private serverWatcher(app:Express){
        app.use('/.handler',async(req,res,next)=>{
            const file = await this.getFile(ServerHandler._proxy.route);
            res.send(file).status(200)
            next();
        })
    }

    private initWatcher(app:Express){
        const iterator:Server.Iterator<AppRouter> = ServerHandler._iteratorAggregate.getIterator();
        do {
            const routeObj:AppRouter = iterator.current();
            if(fs.existsSync(PathUtility.pathofElementWithPoint(routeObj.scene))){
                iterator.addCompilerTuple(this._subject);
            }
        } while (iterator.valid()) 

        
        const setProxy = (req:Express.Request,res:Express.Response,next:NextFunction) =>{
            if(req.path != '/.handler'){
                ServerHandler._proxy.route = req.path;
                console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`));
            }
            next()
        }
        app.use(setProxy)
    }

    private async setFile(key:string){
        console.log("get file" + key)
        const file = fs.readFileSync(PathUtility.dist);
        await this._redisClient.set(key,file)
        return file.toString()
    }

    private async getFile(key:string):Promise<string>{
        if (this._redisClient){
            return await this._redisClient?.get(key) ?? await this.setFile(key);
        } else {
            return fs.promises.readFile(PathUtility.dist,'utf-8');
        }
    }

    private async tryPort(port:Server.Port):Promise<Server.Port>
    {
        while(true){
            const connectionAtempt:boolean = await new Promise<boolean>((resolve,reject)=>{
                const testPort = http.createServer()
                .once('error',(err:Error)=>{
                    if(err.code == 'EADDRINUSE'){
                        resolve(true)
                    } else {
                        reject(err.message)
                    }
                }).once('listening',()=>{
                    testPort.close()
                    resolve(false)
                }).listen(port)
            })
            if (connectionAtempt){
                port = port + 1 as Server.Port
            } else {
                break
            }
        }
        return port;
    }

    private setApp(app:Express):Express
    {
        app.use(compression());
        express.static.mime.define({ 'application/wasm': ['wasm'] });
        app.enable('etag');
        app.set('view engine','ejs')
        app.set('views',PathUtility.getViewerFile())
        app.use(express.static('app/public',optionServer))
        this.initWatcher(app);
        this.serverWatcher(app);
        this.createRoute(app);
        return app;
    }

    private setServer(app:Express):http.Server|TLSServerSingleTone
    {
        const key:Buffer|null = PathUtility.getKeyBuffer()
        const cert:Buffer|null = PathUtility.getCertBuffer()
        const httpServer:http.Server = http.createServer(app);
        if (key && cert){
            const certification:Server.httpsCertificate = {key: key, cert: cert }
            const serverArguments:httpsServerArgs = {
                port:this._port,
                server:httpServer,
                host:'localhost',
                certificate:certification
            }
            const instanceTls = TLSServerSingleTone.getInstance(serverArguments)
            return instanceTls
        } 
        return httpServer;
    }

    private setCallBacks<S extends Simple>(iterfaceServer:Server.Socket<SimpleSocketImplementTupleData<S>,SimpleSocketImplementTuple<S>>)
    {
        iterfaceServer.setData(this.dataCallBack as CallBackSimpleSocketData<S>)
        iterfaceServer.setEnd(this.endCallBack as CallBackSimpleSocket<S>)
        iterfaceServer.setError(this.errorCallBack)
    }

    private dataCallBack<T extends Simple>(data:Server.RequestData|Server.ResponseData,instance:T):void
    {
        if(DataParser.isRequestData(data)){
            const responseArgs:Server.ResponseArguments = {
                protocole:data.protocole,
                code:ResponseParser.tryCode(303),
                message:'OK',
            }
            const responseParser = new ResponseParser(responseArgs); 
            instance.write(responseParser.response)
            ServerHandler._proxy.route = data.path;
        } else {
            responseHandler(data,instance)
        }
    }

    private endCallBack<T extends Simple>(instance:T):void
    {
        const clientProtocole:string = (instance instanceof TLSSocket)?'TLS':'TCP';
        console.log(chalk.bgYellow(`connection to ${clientProtocole} ended`))
    }

    private errorCallBack(error:Error)
    {
        console.log(error.message)
    }

    private upgradeServeur(){
        if(this._server instanceof TLSServerSingleTone){
            /*------handle-https-------*/
            this.setCallBacks<TLSSocket>(this._server)
        } else {
            /*------handle-http--------*/
            this._server.on('upgrade',(req,socket,head)=>{
            const {upgrade:upgrade,'key-tree':treeKey} = req.headers;
            if (upgrade === 'tree-for-three' && treeKey == process.env.PASSWORD_TCP) {
                const instance = SocketTree.getInstance(socket);
                const responseArgs:Server.ResponseArguments = {
                    protocole:'HTTP/1.1',
                    code:ResponseParser.tryCode(101),
                    message:'Switching Protocols',
                    headers: {
                        Connection:"Upgrade",
                        Upgrade:"tree-for-three",
                        'to-compile':ServerHandler._proxy.route
                    }
                }
                const responseParser = new ResponseParser(responseArgs);
                instance.writeToSocket(responseParser.response);
                console.log(chalk.bgGreen('Serveur Has been upgraded'))
                ServerHandler._socketHandlerInterface = new SocketImplement(instance);
                this.setCallBacks<internal.Duplex>(instance)
            } else {
                console.log(chalk.bgRed('Something went wrong during the upgrade'))
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
            })
        }
    }

    private startServerCallBack<T extends ()=>void>(port:Server.Port):T
    {
        const callback = () => {
            const serverType = (this._server instanceof http.Server)? "http":"https";
            const url = `${serverType}://localhost:${port}/`;
            console.log(chalk.greenBright(
                boxen(`Server running on:\u001B]8;;${url}\u0007${port}\u001B]8;;\u0007`,
                {
                    padding: 1,
                })
            ))
        }
        return callback as T
    }

    public run() { 
        this.tryPort(this._port).then((port_correction:Server.Port)=>{
                this._server.listen(port_correction,this.startServerCallBack(port_correction))
        });
    }

    public shutDown(output:string){
        fs.copyFileSync(PathUtility.dist,output)
        process.exit(1)
    }
}
