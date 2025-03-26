import  { router } from "../../route/routeur.js"
import {Context,ServerStrategy} from '../../strategy/strategyServer.js'
import { rollupWatchConfig } from "../../CompilerSetUp/Compiler.js";
// import type {argumentServer} 
// import chalk from 'chalk';
// import boxen from 'boxen';
// import compression from 'compression';
// import livereload from 'livereload';
// import fs from 'fs';
// import https from "https";
// import connectLiveReload from 'connect-livereload'
// import { optionServer } from '../../server/optionStaticFileExpress';
// import PathUtility from '../../CompilerSetUp/Utility/pathUtility';
// import { ObserverWatch,CompilerWatchSubject,ProxyObserver } from '../../oberserver/oberserver';
// import { compiler } from '../../CompilerSetUp/Compiler'

rollupWatchConfig();
const context = new Context(new ServerStrategy(router));
context.runServer();

// const app = express();
// const key = (fs.existsSync(PathUtility.keySLL))?fs.readFileSync(PathUtility.keySLL):null;
// const cert = (fs.existsSync(PathUtility.certSLL))?fs.readFileSync(PathUtility.certSLL):null;
// const server = (key && cert)? https.createServer({key: key, cert: cert }, app):app;

// class a {
//     public b(test:string){
//         console.log(test)
//     }
// }


// const iRouterMatcherExpress:ProxyHandler<a> = {
//     get:function(target:a, p:string, receiver:any)
//     {
//         if(p){
//             return receiver(p)
//         }
//     }
// }
// const A = new a();

// const ProxyObserver:a = new Proxy<a>(Reflect.get(a,'b'),iRouterMatcherExpress)
// console.log(Reflect.get(app,'get').call('/',(req,res)=>{
    // let tst = Reflect.get(app,'get')
// }));
// app.get('/',(req,res)=>{})
// Reflect.get(ProxyObserver, "", )
// const port = process.env.EXPRESS_PORT || 3000;
// const liveReloadServer = livereload.createServer();
// app.use(compression())
// app.use(connectLiveReload())
// app.set('view engine','ejs')
// app.set('views',PathUtility.getViewerFile())
// app.use(express.static('app/public',optionServer))

// async function callCompiler(
//     subject:LibFile.Subject,
//     oberserver:LibFile.Observer
// )
// {
//     return compiler(subject,oberserver)
// }

// const subject:LibFile.Subject = new CompilerWatchSubject()
// const oberserver:LibFile.Observer = new ObserverWatch("/")

// app.use((req,res,next)=>{
//     const oberserver:LibFile.Observer = new ObserverWatch(req.path)
//     ProxyObserver(oberserver,(event:EventFile,path:string)=>{
//         // res.render('index');
//         liveReloadServer.refresh(path);
//     })
//     next();
// });

// app.get('/',(req,res)=>
// {
//     res.render(
//         'index',
//         {
//             title:'test_app'
//         }
//     );
// })


// callCompiler(subject,oberserver)
//     .then(()=>{
//         app.listen(port,()=>{
//         console.log('\n'+chalk.green(
//                     boxen(`Server is running on port : ${port}`,
//                 {
//                     padding: 1,
//                 }
//                 ))
//                 + '\n')
//             })
//     })


/**
 * Concrete Iterators implement various traversal algorithms. These classes
 * store the current traversal position at all times.
 */


// const collection:Server.Aggregator<string> = new WordsCollection();
// collection.addItem('First');
// collection.addItem('Second');
// collection.addItem('Third');
// console.log(collection.getExtremity(false));

// const reverseIterator:Server.Iterator<string> = collection.getIterator();
// while (reverseIterator.valid()) {
//     console.log(reverseIterator.next());
// }