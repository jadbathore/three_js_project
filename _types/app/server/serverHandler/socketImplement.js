import { proxyObserver } from "../../model/oberserver/oberserver.js";
export class Socket {
    handleConnection({ CompilerTuple: [compiler, oberserver] }) {
        compiler.compile();
        proxyObserver(oberserver, (event, path, proxy) => {
        });
    }
    handleDeconnection({ CompilerTuple: [compiler, oberserver] }) {
        compiler.stopCompiler();
    }
}
