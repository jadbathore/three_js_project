import { proxyObserver } from "../../model/oberserver/oberserver.js";
import { AppRouter } from "../../route/routeur.js";

export class Socket implements Server.SocketHandler<AppRouter> {

    public handleConnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        compiler.compile();

        proxy.ProxyBehavior((event,path)=>{
            console.log(event,path)
        })
    }

    public handleFirstConnection({ CompilerTuple: [compiler, oberserver] }: AppRouter): void {
        compiler.repopulate();
    }


    public handleDeconnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        compiler.stopCompiler()
        compiler.destructCompiler()
        proxy.proxyRevoke()
    }
}
