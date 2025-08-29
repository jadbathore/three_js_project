import { proxyObserver } from "../../model/oberserver/oberserver.js";
import { responseAction } from "../../model/server/serverHandler.js";
import { AppRouter } from "../../route/routeur.js";

export class Socket implements Server.SocketHandler<AppRouter,Express.Request> {

    public handleConnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter,request:Express.Request):void
    {
        // console.log(" handleConnection",oberserver.path)
        compiler.compile();
        // console.log(request.action)
         // = (location)=>{
                //     req.action.payload = location;
                //     req.action.type = responseAction.redirection
                // }
        // console.log(request)
        proxyObserver(oberserver,(event,path)=>{
            // request.path = path;
            // request.redir(path)
            // request.action = {
            //     payload: oberserver.path,
            //     type: responseAction.redirection
            // }
            console.log(event,path,request) 

            // console.log(request.action)
            // console.log(request)
            // request.redir()
        })
        // proxy.ProxyBehavior((event,path)=>{
        //     console.log("hello")
        //     console.log(event,path)
        // })
    }

    public handleReconnection({ CompilerTuple: [compiler, oberserver] }: AppRouter): void {
        compiler.repopulate()
    }


    public handleDeconnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        compiler.stopCompiler()
        compiler.destructCompiler()
        // proxy.proxyRevoke()
    }
}
