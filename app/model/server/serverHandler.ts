import {RequestMethod,type AppRouter } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import express ,{ NextFunction, type Express }  from "express";
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

import net from 'net'
import { error } from "console";
import { resolve } from "path";
import { exec } from "child_process";
import { RequestParser, ResponseParser } from "./headParser.js";


enum serverStatus {
    connect = "connect",
    disconnect = "disconnect",
    firstConnection = "first connection"
}

export enum responseAction {
    redirection = "redirect"
}

type middleWare = (req:Express.Request,res:Express.Response,next?:NextFunction)=>boolean;

const debug = true;

function skipMiddleWare(callBack:middleWare){
    return function (
        target:any,
        propertyKey:string,
        descriptor: PropertyDescriptor
    )
    {
        const orginalMethod = descriptor.value;
        // console.log(target,propertyKey)
        descriptor.value = function (...args:[Express.Request,Express.Response]){
            if (callBack(args[0],args[1])){
                return orginalMethod.apply(this,[args[0],args[1]])
            }
        }
        return descriptor;
    }
}

type proxyRoute = string|Express.Request;

export class ServerHandler
{
    private static _socketHandlerInterface:Server.SocketHandler<AppRouter,Express.Request>;
    private static _iteratorAggregate: Server.Aggregator<AppRouter>;

    private _serverConnection: null|http.Server<any, any>|https.Server = null;
    private _server:http.Server|https.Server<any,any>;
    private _app:Express;
    private _proxy: serverTarget<proxyRoute>|any;
    private _redisClient?:RedisClientType<any,any,any>
    private _port:Server.Port

    private readonly _target:serverTarget<proxyRoute> = {
        route:""
    };

    private _subject:LibFile.Subject
    public constructor(
        data:AppRouter[],
        socketHandlerInterface:Server.SocketHandler<AppRouter,Express.Request>,
        subject:LibFile.Subject,
        app:Express,
        port:number
    )
    {
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        ServerHandler._socketHandlerInterface = socketHandlerInterface;
        rollupWatchConfig()
        this.setRedisclient();
        this._subject = subject;
        this._proxy = new Proxy(this._target,this.serverProxyHandler());
        this._port = (this.fourdigitPort(port))? port: 1000 as Server.Port;
        this._app = this.setApp(app)
        this._server = this.setServer(this._app);
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

    private static isExpressRequest(obj:proxyRoute): obj is Express.Request {
        if (typeof obj == 'string') return false;
        return true;
    }

    private fourdigitPort(value:number):value is Server.Port {
        return Number.isInteger(value) && value >= 1000 && value <= 9999
    }

    private serverProxyHandler():ProxyHandler<serverTarget<proxyRoute>>
    {
        return {
            get:function(target:any, prop:keyof serverTarget<proxyRoute>):serverTarget<proxyRoute>|EventServer<serverStatus>
            {
                if(prop){
                    return target[prop]
                }
                return target
            },
            set:function(target:any,prop:keyof serverTarget<proxyRoute>,newvalue:proxyRoute,receiver:any)
            {
                console.log(receiver[prop])
                const routeValue:string = (ServerHandler.isExpressRequest(newvalue))? newvalue.path: newvalue;
                switch(true){
                    case (target[prop] == ''):
                        ServerHandler.accessAppRouter(routeValue,ServerHandler._socketHandlerInterface,serverStatus.firstConnection)
                        target[prop] = {route:newvalue,type:serverStatus.firstConnection};
                        return true;
                    case (routeValue != receiver[prop].route):
                        console.log(routeValue,receiver[prop].route)
                        ServerHandler.accessAppRouter(
                            target?.route ?? target,
                            ServerHandler._socketHandlerInterface,
                            serverStatus.disconnect,
                            routeValue
                        )
                        target[prop] = {route:routeValue,type:serverStatus.disconnect};
                        return true;
                    default: 
                        if (ServerHandler.isExpressRequest(newvalue) && receiver[prop].type != serverStatus.connect){
                            ServerHandler.accessAppRouter(newvalue,ServerHandler._socketHandlerInterface,serverStatus.connect);
                        }
                        target[prop] = {route:routeValue,type:serverStatus.connect};
                        return true;
                }
            }
        }
    }

    private static accessAppRouter(
        targetOld:Express.Request,
        socket:Server.SocketHandler<AppRouter,Express.Request>,
        serverEvent:serverStatus,
    ):void    
    private static accessAppRouter(
        targetOld:string,
        socket:Server.SocketHandler<AppRouter,Express.Request>,
        serverEvent:serverStatus,
    ):void
    private static accessAppRouter(
        targetOld:string,
        socket:Server.SocketHandler<AppRouter,Express.Request>,
        serverEvent:serverStatus,
        targetNew:string
    ):void
    private static accessAppRouter(
        targetOld:proxyRoute,
        socket:Server.SocketHandler<AppRouter,Express.Request>,
        serverEvent:serverStatus,
        targetNew?:string
    ):void
    {
        if (!this.isExpressRequest(targetOld)){
            switch(serverEvent){
                case serverStatus.firstConnection:
                    ServerHandler.handleSocketType(
                        socket.handleReconnection,
                        ServerHandler._iteratorAggregate.getItem(targetOld)
                    )
                break;
                case serverStatus.disconnect:
                    ServerHandler.handleSocketType(
                        socket.handleReconnection,
                        ServerHandler._iteratorAggregate.getItem(targetNew)
                    )
                    ServerHandler.handleSocketType(
                        socket.handleDeconnection,
                        ServerHandler._iteratorAggregate.getItem(targetOld)
                    )
                    
                break;
                default:throw new Error(`unknow type:"${serverEvent}"`)
            }
        } else {
            ServerHandler.handleSocketType(
                socket.handleConnection,
                ServerHandler._iteratorAggregate.getItem(targetOld.path),
                targetOld
            )
        }
    }

    private static handleSocketType(callback:(appRouter:AppRouter)=>void):void 
    private static handleSocketType(callback:(appRouter:AppRouter)=>void,item:AppRouter):void 
    private static handleSocketType(callback:(appRouter:AppRouter,request:Express.Request)=>void,item:AppRouter,request:Express.Request):void 
    private static handleSocketType(callback:(appRouter:AppRouter,request?:Express.Request)=>void,item?:AppRouter,request?:Express.Request):void 
    {
        if(item?.CompilerTuple ?? false){
            callback(item,request)
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
        app.use('/.reload',(req,res,next)=>{
            setTimeout(()=>{
                res.write("window.location.href = '/'")
            },5000)
            next();
        })
        app.use('/.handler',async(req,res,next)=>{
            // console.log(this._proxy.route.route)
            const file = await this.getFile(this._proxy.route.route);
            res.send(file).status(200)
            next();
        })
    }

    private restartProxy(){
        this._proxy.route = "";
    }

    private initWatcher(app:Express){
        const iterator:Server.Iterator<AppRouter> = ServerHandler._iteratorAggregate.getIterator();
        do {
            const routeObj:AppRouter = iterator.current();
            if(fs.existsSync(PathUtility.pathofElementWithPoint(routeObj.scene))){
                iterator.addCompilerTuple(this._subject);
            }
        } while (iterator.valid()) 
        const  setAction = (req:Express.Request,res:Express.Response,next:NextFunction) =>{
            if (req.action == undefined){
                req.action = {
                    payload:null,
                    type:null
                }
            }
            next()

        }
        // const setHeader = (req:Express.Request,res:Express.Response,next:NextFunction)=>{
        //     res.setHeader('Connection', 'Upgrate'); 
        //     res.setHeader('X-Powered-By','Express-tree-for-three')
        //     res.setHeader('Upgrade','tree-for-three')
        //     next()
        // }
        this._proxy.route = "/";
        const setProxy = (req:Express.Request,res:Express.Response,next:NextFunction) =>{
            // console.log(req.action)
            if(req.path != '/.handler'){
                this._proxy.route = req;
                console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`));
            }
            console.log("middleware2",req.path)
            next()
        }
        app.use(/*setHeader,*/setAction,setProxy)
        app.post("/reload",(req,res)=>{
            res.redirect('/')
        })
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

    private websocket(){
        http.createServer((req, res) => {})
        
    }

    private setServer(app:Express):http.Server|https.Server<any,any>
    {
        const key:Buffer|null = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
        const cert:Buffer|null = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
        const server =  (key && cert)?  https.createServer({key: key, cert: cert },app):http.createServer(app);
        return server
    }

    public runServer(app:Express) { 
        this._app.use(compression());
        express.static.mime.define({ 'application/wasm': ['wasm'] });
        this._app.enable('etag');
        this._app.set('view engine','ejs')
        this._app.set('views',PathUtility.getViewerFile())
        this._app.use(express.static('app/public',optionServer))
        const port:Server.Port = (process.env.EXPRESS_PORT || 3000) as Server.Port;
        const key:Buffer|null = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
        const cert:Buffer|null = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
        const server:express.Express|https.Server<any,any> = (key && cert)?  https.createServer({key: key, cert: cert }, this._app):this._app;
        this.initWatcher(this._app);
        this.serverWatcher(this._app);
        this.createRoute(this._app);
        this.tryPort(port).then((port_correction:Server.Port)=>{
            this._serverConnection = server.listen(port_correction,()=>{
                const serverType = (server instanceof https.Server)? "https":"http";
                const url = `${serverType}://localhost:${port_correction}/`;
                console.log(chalk.greenBright(
                    boxen(`Server running on:\u001B]8;;${url}\u0007${port_correction}\u001B]8;;\u0007`,
                    {
                        padding: 1,
                    })
                ))
            })
        });
    }

    public upgradeServeur(){
        this._server.on('upgrade',(req,socket,head)=>{
            const {upgrade:upgrade,'key-tree':treeKey} = req.headers;
            if (upgrade === 'tree-for-three' && treeKey == '1234') {
            console.log('tree-for-three protocole active')
            socket.write(
                'HTTP/1.1 101 Switching Protocols\r\n' +
                'Connection: Upgrade\r\n' +
                'Upgrade: tree-for-three\r\n\r\n'
            );

            // socket.write(chalk.green('TCP started!\n'));
            socket.on('data', (data) => {
                console.log(data.toString());
            });
        } else {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        }
        })
    }

    public run() { 
        this.tryPort(this._port).then((port_correction:Server.Port)=>{
            this.upgradeServeur()
            this._serverConnection = this._server.listen(port_correction,()=>{
                const serverType = (this._server instanceof https.Server)? "https":"http";
                const url = `${serverType}://localhost:${port_correction}/`;
                console.log(chalk.greenBright(
                    boxen(`Server running on:\u001B]8;;${url}\u0007${port_correction}\u001B]8;;\u0007`,
                    {
                        padding: 1,
                    })
                ))
            })

        });

    }

    public restartServer(){
        this._serverConnection.close()
        this.restartProxy()
        this.run()
    }

    public shutDown(path:string){
        this._serverConnection.close(()=>{
            fs.copyFileSync("app/public/dist/compling.js",path)
            process.exit(1);
        })
    }
}


// const server = http.createServer((req, res) => {
//   let body = '';
//   req.on('data', chunk => body += chunk);
//   req.on('end', () => {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ received: body }));
//   });
// });

// // Démarrer le serveur sur un port random (0 = système choisit un port dispo)
// server.listen(0, () => {
//   const { port } = server.address() as any;

//   const options = {
//     hostname: 'localhost',
//     port,
//     path: '/',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     }
//   };

//   const req = http.request(options, (res) => {
//     let data = '';
//     res.on('data', chunk => data += chunk);
//     res.on('end', () => {
//       console.log('Réponse du serveur :', data);
//       server.close(); // ferme après le test
//     });
//   });

//   req.write(JSON.stringify({ msg: 'Hello test' }));
//   req.end();
// });