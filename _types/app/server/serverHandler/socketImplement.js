import { proxyObserver } from "../../model/oberserver/oberserver.js";
export class Socket {
    handleConnection({ CompilerTuple: [compiler, oberserver, proxy] }, request) {
        compiler.compile();
        proxyObserver(oberserver, (event, path) => {
            console.log(event, path, request);
        });
    }
    handleReconnection({ CompilerTuple: [compiler, oberserver] }) {
        compiler.repopulate();
    }
    handleDeconnection({ CompilerTuple: [compiler, oberserver, proxy] }) {
        compiler.stopCompiler();
        compiler.destructCompiler();
    }
}
