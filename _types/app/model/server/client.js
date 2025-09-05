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
        this._instanceClient.on('error', callBack);
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
    constructor() { super(); }
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
function httpsMixin(Base) {
    class Https extends Base {
        constructor(...args) {
            super(...args);
        }
        createConnection(port, host) {
            const options = {
                host: host,
                port: port,
                servername: host,
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
    return Https;
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
export class TLSClientSingleTone extends httpsMixin((WebSocketHolder)) {
    constructor(port, host, webSocketPort) {
        super(webSocketPort);
        this._instanceClient = this.createConnection(port, host);
    }
    static getInstance(port, host, webSocketPort) {
        if (!TLSClientSingleTone._instance) {
            TLSClientSingleTone._instance = new TLSClientSingleTone(port, host, webSocketPort);
        }
        return TLSClientSingleTone._instance;
    }
}
export class TLSServerSingleTone extends httpsMixin((SimpleSocket)) {
    constructor(port, httpServer, host, certificate) {
        super();
        this._instanceClient = this.createConnection(port, host);
        this._instanceTlsServer = this.createServeur(httpServer, certificate);
    }
    static getInstance({ port: port, server: http, host: host, certificate: certificate }) {
        if (!TLSServerSingleTone._instance) {
            TLSServerSingleTone._instance = new TLSServerSingleTone(port, http, host, certificate);
        }
        return TLSServerSingleTone._instance;
    }
    createServeur(httpServer, certificate) {
        const tlsServer = tls.createServer(certificate, (tlsSocket) => {
            httpServer.emit('connection', tlsSocket);
        });
        return tlsServer;
    }
    listen(port, callBack) {
        this._instanceTlsServer.listen(port, callBack);
    }
}
__decorate([
    oneCall
], TLSServerSingleTone.prototype, "listen", null);
