import net from 'net';
import http from 'http';
import { TLSSocket } from 'tls';
import ws from 'ws';
import internal from 'stream';
export type webSocketServer = ws.Server<typeof ws, typeof http.IncomingMessage>;
type TupleData = [Server.ResponseData | Server.RequestData, net.Socket | internal.Duplex, ...any];
type TupleInstance = [net.Socket | internal.Duplex, ...any];
declare abstract class SocketSingleTone<A extends TupleData, B extends TupleInstance> {
    protected abstract _instanceClient: net.Socket | internal.Duplex | TLSSocket;
    setData(callBack: (...A: A) => void): void;
    setConnection(callBack: (...args: B) => void): void;
    setClose(callBack: (...args: B) => void): void;
    setError(callBack: (...args: B) => void): void;
    setEnd(callBack: (...args: B) => void): void;
    protected setEventCallBack(callBack: (...args: B) => void, event: string): void;
    protected abstract socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: (...args: A) => void): T;
    protected abstract socketmount<T extends () => void>(callback: (...args: B) => void): T;
}
declare abstract class SimpleSocket<S extends internal.Duplex | TLSSocket> extends SocketSingleTone<[Server.ResponseData | Server.RequestData, S], [S]> {
    protected abstract _instanceClient: S;
    protected constructor(websocketPort: Server.Port);
    protected socketmount<T extends () => void>(callback: (...args: [S]) => void): T;
    protected socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: (...args: [Server.ResponseData | Server.RequestData, S]) => void): T;
}
declare abstract class WebSocketHolder<S extends net.Socket | TLSSocket> extends SocketSingleTone<[
    Server.ResponseData | Server.RequestData,
    S,
    webSocketServer
], [
    S,
    webSocketServer
]> {
    protected _instanceWebSocket: webSocketServer;
    protected abstract _instanceClient: S;
    protected constructor(websocketPort: Server.Port);
    protected socketmount<T extends () => void>(callback: (...args: [S, webSocketServer]) => void): T;
    protected socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: (...args: [Server.ResponseData | Server.RequestData, S, webSocketServer]) => void): T;
    protected createWebSocketConnection(websocketPort: Server.Port): webSocketServer;
}
export declare class SocketTree extends SimpleSocket<internal.Duplex> {
    private static _instance;
    protected _instanceClient: internal.Duplex;
    private constructor();
    static getInstance(socket?: internal.Duplex): SocketTree;
    writeToSocket(value: string): void;
}
export declare class SocketTLS extends SimpleSocket<TLSSocket> {
    protected _instanceClient: TLSSocket;
    private static _instance;
    private constructor();
    static get instance(): SocketTLS;
    private createConnection;
}
export declare class TCPServerSingleTone extends WebSocketHolder<net.Socket> {
    static readonly UpgratedProtocole: string;
    private static _instance;
    protected _instanceClient: net.Socket;
    private constructor();
    private createConnection;
    static getInstance(port: Server.Port, webSocketPort: Server.Port): TCPServerSingleTone;
}
export declare class TLSServerSingleTone extends WebSocketHolder<TLSSocket> {
    protected _instanceClient: TLSSocket;
    private static _instance;
    private _instanceTlsServer;
    private constructor();
    private createServeur;
    private createConnection;
    listenServer(callBack: () => void): void;
}
export {};
