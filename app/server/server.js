// import express from 'express';
// import chalk from 'chalk';
// import boxen from 'boxen';
// import fs from 'fs';
// import compression from 'compression';
// import livereload from 'livereload';
// import connectLiveReload from 'connect-livereload';
// import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
// import { optionServer } from './optionStaticFileExpress.js';
// import { CompilerWatchSubject,ObserverWatch,proxyObserver,proxyRevokeCall } from '../../_types/app/oberserver/oberserver.js';
// import { Compiler,rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
// import https from 'https';
import { ServerStrategy,Context } from '../../_types/app/model/strategy/strategyServer.js';
import { router } from '../../_types/app/route/routeur.js';

const serverStrategy = new Context(new ServerStrategy(router))
serverStrategy.runServer()

// rollupWatchConfig();
// const app = express();
// const liveReloadServer = livereload.createServer();

// const key = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
// const cert = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;

// const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;
// const port = process.env.EXPRESS_PORT || 3000;

// app.use(compression())
// app.set('view engine','ejs')
// app.set('views',PathUtility.getViewerFile())
// app.use(express.static('app/public',optionServer))

// function callCompiler(subject,oberserver)
// {
//     const compiler = new Compiler(oberserver,subject)
//     compiler.compile();
//     proxyObserver(oberserver,(event,path,proxy)=>{
//         console.log(event,path,proxy)
//         if(event.filename == "3.cameraSetting.js")
//             {
//                 subject.detach(oberserver)
//                 proxyRevokeCall(proxy,oberserver).revoke();
//             }    
//         liveReloadServer.refresh(path);
//     })
// }
// const subject = new CompilerWatchSubject()
// const oberserver = new ObserverWatch('/')
// callCompiler(subject,oberserver,PathUtility.rootDirProjectName)





// app.get('/',(req,res)=>
// {
//     res.render(
//         'index',
//         {
//             title:'test_app'
//         }
//     );
// })


// // callCompiler(subject,oberserver)
// //     .then(()=>{
// server.listen(port,()=>{
// console.log('\n'+chalk.green(
//             boxen(`Server is running on port : ${port}`,
//         {
//             padding: 1,
//             height: 2 ,
//         }
//         ))
//         + '\n')
//     })
//     // })


