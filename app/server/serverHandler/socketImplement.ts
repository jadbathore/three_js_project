import { proxyObserver } from "../../model/oberserver/oberserver.js";
import { DataParser, RequestParser, ResponseParser } from "../../model/server/headParser.js";
import { AppRouter } from "../../route/routeur.js";
import { SocketTree } from "../../model/server/client.js";

export class SocketImplement implements Server.SocketHandler<AppRouter> {

    private static instanceServer:SocketTree;
    
    constructor(socket:SocketTree)
    {
        SocketImplement.instanceServer = socket
    }

    public handleConnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        compiler.compile();
        proxyObserver(oberserver,(event,path)=>{
            const responseArgs:Server.RequestArguments = {
                path:DataParser.tryPath(path),
                host:'localhost',
                method:"RELOAD",
                protocole:"TREE-FOR-THREE",
                body:'Reload from Post Compile'
            }
            const requestParser = new RequestParser(responseArgs);
            setTimeout(()=>{
                SocketImplement.instanceServer.writeToSocket(requestParser.request)
            },500)
        })
    }

    public handleReconnection({ CompilerTuple: [compiler, oberserver] }: AppRouter): void {
        compiler.repopulate()
    }


    public handleDeconnection({CompilerTuple:[compiler,oberserver,proxy]}:AppRouter):void
    {
        compiler.stopCompiler()
        compiler.destructCompiler()
        setTimeout(()=>{
            const responseArgs:Server.RequestArguments = {
                path:DataParser.tryPath(oberserver.path),
                host:'localhost',
                method:"RELOAD",
                protocole:"TREE-FOR-THREE",
                body:'Reload change compilation'
            }
            const requestParser = new RequestParser(responseArgs);
            SocketImplement.instanceServer.writeToSocket(requestParser.request)
        },500)
        // proxy.proxyRevoke()
    }
}
