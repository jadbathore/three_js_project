import net from 'net';
import http from 'http';
import ws from 'ws';
import internal from 'stream';
export type webSocketServer = ws.Server<typeof ws, typeof http.IncomingMessage>;
type ServerTupleData = [Server.RequestData | Server.ResponseData, internal.Duplex];
type ServerTuple = [internal.Duplex];
type ClientTupleData = [Server.RequestData | Server.ResponseData, net.Socket, webSocketServer];
type ClientTuple = [net.Socket, webSocketServer];
export type CallBackClient = Server.InstanceClientCallBack<ClientTuple>;
export type CallBackClientData = Server.InstanceClientCallBackData<ClientTupleData>;
export type CallBackServer = Server.InstanceClientCallBack<ServerTuple>;
export type CallBackServerData = Server.InstanceClientCallBack<ServerTupleData>;
declare abstract class SocketSingleTone<A extends [Server.RequestData | Server.ResponseData, net.Socket | internal.Duplex, ...any], B extends [net.Socket | internal.Duplex, ...any]> {
    protected abstract _instanceClient: net.Socket | internal.Duplex;
    setData(callBack: (...A: A) => void): void;
    setConnection(callBack: (...args: B) => void): void;
    setClose(callBack: (...args: B) => void): void;
    setError(callBack: (...args: B) => void): void;
    setEnd(callBack: (...args: B) => void): void;
    protected setEventCallBack(callBack: (...args: B) => void, event: string): void;
    protected abstract socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: (...args: A) => void): T;
    protected abstract socketmount<T extends () => void>(callback: (...args: B) => void): T;
}
export declare class TCPServerSingleTone extends SocketSingleTone<[
    Server.RequestData | Server.ResponseData,
    net.Socket,
    webSocketServer
], [
    net.Socket,
    webSocketServer
]> {
    static readonly UpgratedProtocole: string;
    private static _instance;
    protected _instanceClient: net.Socket;
    private _instanceWebSocket;
    private readonly _port;
    private readonly _webSocketPort;
    private constructor();
    private createWebSocketConnection;
    private createConnection;
    static getInstance(port: Server.Port, webSocketPort: Server.Port): TCPServerSingleTone;
    protected socketmount<T extends () => void>(callback: CallBackClient): T;
    protected socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: CallBackClientData): T;
}
export declare class SocketTree extends SocketSingleTone<ServerTupleData, ServerTuple> {
    private static _instance;
    protected _instanceClient: internal.Duplex;
    private constructor();
    static getInstance(socket?: internal.Duplex): SocketTree;
    writeToSocket(value: string): void;
    protected socketmount<T extends () => void>(callback: CallBackServer): T;
    protected socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: CallBackServerData): T;
}
export {};
