// import express ,{type Express,type IRouter,type Router}  from "express";
// import fs from 'fs' 
// import https from 'https'
// import { createServer } from "node:http";
// import compression from 'compression';
// import livereload from 'livereload';
// import connectLiveReload from 'connect-livereload';
// import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
// import  { RequestMethod,type AppRouter}  from "../../route/routeur.js"
// import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
// import { optionServer } from '../../server/optionStaticFileExpress.js';
// import { CompilerWatchSubject,ObserverWatch,proxyRevokeCall } from '../oberserver/oberserver.js';
// import { Compiler,rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
// import {Server as ioServer} from 'socket.io'
// import { createAdapter } from "@socket.io/redis-adapter"
// import {createClient} from "redis"
// import chalk from "chalk";
// import boxen from "boxen";

// enum serverStatus {
//     connect = "connect",
//     disconnect = "disconnect",
// }


// export class Context {
//     private _strategy: Server.Strategy;
//     private _subject:CompilerWatchSubject;  
//     private _serverEvent:EventServer<serverStatus>;
//     private readonly _proxyHandler:ProxyHandler<EventServer<serverStatus>[]>
//     private _proxy:{
//         proxy: EventServer<serverStatus>[];
//         revoke: () => void;
//     };

//     constructor(strategy: Server.Strategy) {
//         this._strategy = strategy;
//         this._subject = new CompilerWatchSubject();
//         this._proxyHandler = this.setServerEventProxy();
//     }

//     public setStrategy(strategy: Server.Strategy) {
//         this._strategy = strategy;
//     }

//     public runServer(): void {
//         rollupWatchConfig()
//         const app:Express = express()
//         app.use(compression());
//         // app.use(connectLiveReload())
//         app.set('view engine','ejs')
//         app.set('views',PathUtility.getViewerFile())
//         app.use(express.static('app/public',optionServer))
//         const key:Buffer|null = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
//         const cert:Buffer|null = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
//         const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;
//         const port = process.env.EXPRESS_PORT || 3004;
//         this.serverWatcher(app)
//         this._strategy.doAlgorithm(app,this._subject);
//         server.listen(port,()=>{
//             console.log(chalk.greenBright(
//                 boxen(`Server is running on port : ${port}`,
//                 {
//                     padding: 1,
//                 })
//             ))
//         }) 
//     }


//     private setServerEventProxy():ProxyHandler<EventServer<serverStatus>[]>{
//         return {
//             get:function(target:EventServer<serverStatus>[], p:string, receiver:any)
//             {
//                 if(p){
//                     const index:number = parseInt(p)
//                     return target[index]
//                 }
//                 return target
//             },
//             set:function(target:EventServer<serverStatus>[],p:string,newvalue:any,receiver:any):boolean{
//                 const index:number = parseInt(p)
//                 target[index] = newvalue
//                 return true
//             }
//         }
//     }

//     private Proxy(){
//         function proxyServerSocket(
//             arrayProxy:EventServer<serverStatus>[],
//             handler:ProxyHandler<EventServer<serverStatus>[]>,
//         )
//         {
//             const _array:EventServer<serverStatus>[] = []
//             const proxyServerEvent: {
//                 proxy: EventServer<serverStatus>[];
//                 revoke: () => void;
//             } = Proxy.revocable(arrayProxy,handler);

//             Object.defineProperty(proxyServerEvent,'push', 
//                 {
//                     value: function():void
//                     {
//                         console.log(arguments[0]);
//                         const EventServer:EventServer<serverStatus> = {route:arguments[0],type:serverStatus.connect}
//                     },
//                     writable: true,
//                     configurable: true
//             })
//             return proxyServerEvent
//         }
//         this._proxy = proxyServerSocket(this._serverEvent,this._proxyHandler);
//     }

//     public revokeProxy(){

//         Object.defineProperty(this._proxy,'push', 
//             {
//                 writable: false,
//                 configurable: false
//         })
//         this._proxy.revoke();
//     }

//     public serverWatcher(app:Express){
//         app.use((req,res,next)=>{
//             if (this._serverEvent.route == req.path){
//                 this._serverEvent = {
//                     route :req.path,
//                     type: serverStatus.connect
//                 }
//             } else {
//                 this._serverEvent = {
//                     route :this._serverEvent.route,
//                     type: serverStatus.disconnect
//                 }
//                 this._serverEvent = {
//                     route :req.path,
//                     type: serverStatus.disconnect
//                 }
//             }

//             next();
//         })
//     }
// }

// export class ServerStrategy implements Server.Strategy {
//     private _data:AppRouter[];
//     private _iteratorAggregate: Server.Aggregator<AppRouter>;

//     constructor(data:AppRouter[]){
//         this._data = data;
//         this._iteratorAggregate = new ServerRouteAggregate(data);
//     }

//     public doAlgorithm(app:Express,subject:LibFile.Subject):void {
//         this.createRoute(app,subject);
//         const iterator:Server.Iterator<AppRouter> = this._iteratorAggregate.getIterator();
//     }

//     private createRoute(app:Express,subject:LibFile.Subject){
//         const iterator:Server.Iterator<AppRouter> = this._iteratorAggregate.getIterator();
//         do {
//             const routeObj:AppRouter = iterator.current();
//             if(routeObj.method != RequestMethod.middleWare){
//                 if(fs.existsSync(routeObj.scene)){
//                     iterator.addCompilerTuple(subject);
//                 }
//                 app[routeObj.method](routeObj.pathServer,routeObj.serverLogic);
//             } else {
//                 app[routeObj.method](routeObj.serverLogic);
//             }
//         } while (iterator.valid()) 
//     }
// }