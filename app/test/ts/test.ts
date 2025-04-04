
// import { CompilerWatchSubject, ObserverWatch } from '../../oberserver/oberserver.js';
import { router } from '../../route/routeur.js';
import { Context,ServerStrategy} from '../../strategy/strategyServer.js';
// import Compiler from '../js/compiler.js'


// const Subject = new CompilerWatchSubject();
// const Observer = new ObserverWatch('/');
// const compiler = new Compiler(Observer,Subject);
// compiler.compile()
// setTimeout(()=>{
//     compiler.DestructCompiler()
//     console.log(Subject.observers)
// },3000)

const server = new Context(new ServerStrategy(router))
server.runServer();
// console.log("hello world");