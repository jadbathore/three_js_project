var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import net from 'net';
import { DataParser, RequestParser } from './headParser.js';
import tls from 'tls';
import ws from 'ws';
import internal from 'stream';
const _array = [];
function oneCall(_, propertyKey, descriptor) {
    const orginalMethod = descriptor.value;
    descriptor.value = function (...args) {
        if (!_array.includes(propertyKey)) {
            _array.push(propertyKey);
            return orginalMethod.apply(this, args);
        }
    };
}
class SocketSingleTone {
    setData(callBack) {
        this._instanceClient.on('data', this.socketmountData((...args) => {
            callBack(...args);
        }));
    }
    setConnection(callBack) {
        this.setEventCallBack(callBack, 'connection');
    }
    setClose(callBack) {
        this.setEventCallBack(callBack, 'close');
    }
    setError(callBack) {
        this.setEventCallBack(callBack, 'error');
    }
    setEnd(callBack) {
        this.setEventCallBack(callBack, 'end');
    }
    setEventCallBack(callBack, event) {
        this._instanceClient.on(event, this.socketmount((...args) => {
            callBack(...args);
        }));
    }
}
__decorate([
    oneCall
], SocketSingleTone.prototype, "setConnection", null);
__decorate([
    oneCall
], SocketSingleTone.prototype, "setClose", null);
__decorate([
    oneCall
], SocketSingleTone.prototype, "setError", null);
__decorate([
    oneCall
], SocketSingleTone.prototype, "setEnd", null);
class SimpleSocket extends SocketSingleTone {
    constructor(websocketPort) { super(); }
    socketmount(callback) {
        const socket = () => {
            callback(this._instanceClient);
        };
        return socket;
    }
    socketmountData(callback) {
        const socket = (data) => {
            const dataParse = DataParser.responseOrRequest(data.toString());
            callback(dataParse, this._instanceClient);
        };
        return socket;
    }
}
class WebSocketHolder extends SocketSingleTone {
    constructor(websocketPort) {
        super();
        this._instanceWebSocket = this.createWebSocketConnection(websocketPort);
    }
    socketmount(callback) {
        const socket = () => {
            callback(this._instanceClient, this._instanceWebSocket);
        };
        return socket;
    }
    socketmountData(callback) {
        const socket = (data) => {
            const dataParse = DataParser.responseOrRequest(data.toString());
            callback(dataParse, this._instanceClient, this._instanceWebSocket);
        };
        return socket;
    }
    createWebSocketConnection(websocketPort) {
        return new ws.Server({ port: websocketPort });
    }
}
function Logger(Base) {
    return class extends Base {
        constructor(...args) {
            super();
            this._instanceClient = new internal.PassThrough();
        }
        log(msg) {
            console.log("[LOG]", msg);
        }
    };
}
class Test extends Logger((SimpleSocket)) {
    constructor() {
        super();
    }
    test() {
        this.log();
    }
}
export class SocketTree extends SimpleSocket {
    constructor(socket) {
        super();
        this._instanceClient = socket;
    }
    static getInstance(socket) {
        if (!SocketTree._instance && socket) {
            SocketTree._instance = new SocketTree(socket);
        }
        return SocketTree._instance;
    }
    writeToSocket(value) {
        this._instanceClient.write(value);
    }
}
export class SocketTLS extends SimpleSocket {
    constructor() {
        super();
        this._instanceClient = this.createConnection();
    }
    static get instance() {
        if (!SocketTLS._instance) {
            SocketTLS._instance = new SocketTLS();
        }
        return SocketTLS._instance;
    }
    createConnection() {
        const options = {
            host: 'localhost',
            port: 3000,
            servername: 'localhost',
            rejectUnauthorized: false,
        };
        const socket = tls.connect(options, () => {
            console.log('TLS connected');
            const requestArgs = {
                method: 'GET',
                path: DataParser.tryPath("/"),
                host: 'localhost',
                protocole: "HTTP/1.1",
                headers: {
                    Connection: 'close'
                }
            };
            const requestParse = new RequestParser(requestArgs);
            socket.write(requestParse.request);
        });
        return socket;
    }
}
export class TCPServerSingleTone extends WebSocketHolder {
    constructor(port, websocket) {
        super(websocket);
        this._instanceClient = this.createConnection(port);
    }
    createConnection(port) {
        const client = net.createConnection({ port: port }, () => {
            const requestHeader = {
                method: 'GET',
                path: DataParser.tryPath('/'),
                protocole: 'HTTP/1.1',
                host: 'localhost',
                headers: {
                    'Connection': 'Upgrade',
                    'Upgrade': 'tree-for-three',
                    'key-tree': process.env.PASSWORD_TCP,
                },
            };
            const requestParse = new RequestParser(requestHeader);
            client.write(requestParse.request);
        });
        return client;
    }
    static getInstance(port, webSocketPort) {
        if (!TCPServerSingleTone._instance) {
            TCPServerSingleTone._instance = new TCPServerSingleTone(port, webSocketPort);
        }
        return TCPServerSingleTone._instance;
    }
}
TCPServerSingleTone.UpgratedProtocole = 'THREE-FOR-THREE';
export class TLSServerSingleTone extends WebSocketHolder {
    constructor(port, httpsServer, websocket) {
        super(websocket);
        this._instanceTlsServer = this.createServeur(httpsServer, port);
    }
    createServeur(httpServer, port) {
        const options = {
            host: 'localhost',
            port: port,
            servername: 'localhost',
            rejectUnauthorized: false,
        };
        const tlsServer = tls.createServer(options, (tlsSocket) => {
            httpServer.emit('connection', tlsSocket);
        });
        return tlsServer;
    }
    createConnection(port) {
        const options = {
            host: 'localhost',
            port: port,
            servername: 'localhost',
            rejectUnauthorized: false,
        };
        const socket = tls.connect(options, () => {
            console.log('TLS connected');
            const requestArgs = {
                method: 'GET',
                path: DataParser.tryPath("/"),
                host: 'localhost',
                protocole: "HTTP/1.1",
                headers: {
                    Connection: 'close'
                }
            };
            const requestParse = new RequestParser(requestArgs);
            socket.write(requestParse.request);
        });
        return socket;
    }
    listenServer(callBack) {
        this._instanceTlsServer.listen(callBack);
    }
}
__decorate([
    oneCall
], TLSServerSingleTone.prototype, "listenServer", null);
