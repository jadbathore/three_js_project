import { proxyObserver } from "../../model/oberserver/oberserver.js";
import { DataParser, RequestParser } from "../../model/server/headParser.js";
export class SocketImplement {
    constructor(socket) {
        SocketImplement.instanceServer = socket;
    }
    handleConnection({ CompilerTuple: [compiler, oberserver, proxy] }) {
        compiler.compile();
        proxyObserver(oberserver, (event, path) => {
            const responseArgs = {
                path: DataParser.tryPath(path),
                host: 'localhost',
                method: "RELOAD",
                protocole: "TREE-FOR-THREE",
                body: 'Reload from Post Compile'
            };
            const requestParser = new RequestParser(responseArgs);
            setTimeout(() => {
                SocketImplement.instanceServer.writeToSocket(requestParser.request);
            }, 500);
        });
    }
    handleReconnection({ CompilerTuple: [compiler, oberserver] }) {
        compiler.repopulate();
    }
    handleDeconnection({ CompilerTuple: [compiler, oberserver, proxy] }) {
        compiler.stopCompiler();
        compiler.destructCompiler();
        setTimeout(() => {
            const responseArgs = {
                path: DataParser.tryPath(oberserver.path),
                host: 'localhost',
                method: "RELOAD",
                protocole: "TREE-FOR-THREE",
                body: 'Reload change compilation'
            };
            const requestParser = new RequestParser(responseArgs);
            SocketImplement.instanceServer.writeToSocket(requestParser.request);
        }, 500);
    }
}
