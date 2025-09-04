var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import net from 'net';
import { DataParser, RequestParser } from '../../app/model/server/headParser.js';
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
export class TCPServerSingleTone extends SocketSingleTone {
    constructor(port, websocket) {
        super();
        this._port = port;
        this._webSocketPort = websocket;
        this._instanceWebSocket = this.createWebSocketConnection(this._webSocketPort);
        this._instanceClient = this.createConnection(this._port);
    }
    createWebSocketConnection(websocketPort) {
        return new ws.Server({ port: websocketPort });
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
}
TCPServerSingleTone.UpgratedProtocole = 'THREE-FOR-THREE';
export class SocketTree extends SocketSingleTone {
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
