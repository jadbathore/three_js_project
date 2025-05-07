export class Socket {
    handleConnection({ CompilerTuple: [compiler, oberserver, proxy] }) {
        compiler.compile();
        proxy.ProxyBehavior((event, path) => {
            console.log(event, path);
        });
    }
    handleDeconnection({ CompilerTuple: [compiler, oberserver, proxy] }) {
        compiler.stopCompiler();
        compiler.destructCompiler();
        proxy.proxyRevoke();
    }
}
