import { proxyObserver } from "../../model/oberserver/oberserver.js";
import { AppRouter } from "../../route/routeur.js";

export class Socket implements Server.SocketHandler<AppRouter> {

    public handleConnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void
    {
        compiler.compile()
        proxyObserver(oberserver,(event,path,proxy)=>{
            // console.log(event,path,proxy)
        })
    }

    public handleDeconnection({CompilerTuple:[compiler,oberserver]}:AppRouter):void
    {
        compiler.stopCompiler()
    }
}
