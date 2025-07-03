import { proxyObserver } from "../../model/oberserver/oberserver.js";
import { AppRouter } from "../../route/routeur.js";

export class Socket implements Server.SocketHandler<AppRouter> {

    public handleConnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        // appel du compilateur 
        compiler.compile()
        // appel de la proxy 
        proxy.ProxyBehavior((event,path)=>{
            console.log(event,path)
        })
    }

    public handleDeconnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        // arrêt du compilateur
        compiler.stopCompiler()
        // destruction du compilateur
        compiler.destructCompiler()
        proxy.proxyRevoke()
    }
}
