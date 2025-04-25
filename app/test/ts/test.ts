// import express ,{Handler, type Express,type IRouter,type Router}  from "express";
// import fs from 'fs';
// import https from 'https'
// import compression from "compression";
// import chalk from "chalk";
// import boxen from "boxen";
// import {RequestMethod,router,type AppRouter } from "../../route/routeur.js"
// import { ServerRouteAggregate } from "../../model/iterator/iteratorServer.js";
// import PathUtility from "../../model/CompilerSetUp/Utility/pathUtility.js";
// import { optionServer } from "../../server/optionStaticFileExpress.js";
// import { CompilerWatchSubject, proxyObserver } from "../../model/oberserver/oberserver.js";
// import { connection, Connection } from "mongoose";
// import { Compiler } from "../../model/CompilerSetUp/Compiler.js";





// class Socket implements SocketHandler {

//     public handleConnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void
//     {
//         compiler.compile()
//         proxyObserver(oberserver,(event,path,proxy)=>{
//             console.log(event,path,proxy)
//         })
//     }

//     public handleDeconnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void
//     {
//         compiler.DestructCompiler()
//     }
// }

// const z = new Socket();
// const s = new CompilerWatchSubject()
// const Tser = new ServerHandler(router,z,s)
// const app = express()
// Tser.runServer(app)