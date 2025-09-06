import net from 'net';
import http from 'http';
import tls, { TLSSocket } from 'tls';
import ws from 'ws';
import internal from 'stream';
export type webSocketServer = ws.Server<typeof ws, typeof http.IncomingMessage>;
type TupleData = [Server.ResponseData | Server.RequestData, net.Socket | internal.Duplex, ...any];
type TupleInstance = [net.Socket | internal.Duplex, ...any];
declare abstract class SocketSingleTone<A extends TupleData, B extends TupleInstance> implements Server.Socket<TupleData, TupleInstance> {
    protected abstract _instanceClient: net.Socket | internal.Duplex | TLSSocket;
    setData(callBack: (...A: A) => void): void;
    setConnection(callBack: (...args: B) => void): void;
    setClose(callBack: (...args: B) => void): void;
    setError(callBack: (error: Error) => void): void;
    setEnd(callBack: (...args: B) => void): void;
    protected setEventCallBack(callBack: (...args: B) => void, event: string): void;
    protected abstract socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: (...args: A) => void): T;
    protected abstract socketmount<T extends () => void>(callback: (...args: B) => void): T;
}
export type Simple = internal.Duplex | TLSSocket;
export type SimpleSocketImplementTupleData<S extends Simple> = [Server.ResponseData | Server.RequestData, S];
export type SimpleSocketImplementTuple<S extends Simple> = [S];
export type CallBackSimpleSocketData<S extends Simple> = (...args: SimpleSocketImplementTupleData<S>) => void;
export type CallBackSimpleSocket<S extends Simple> = (...args: SimpleSocketImplementTuple<S>) => void;
declare abstract class SimpleSocket<S extends Simple> extends SocketSingleTone<SimpleSocketImplementTupleData<S>, SimpleSocketImplementTuple<S>> implements Server.Socket<SimpleSocketImplementTupleData<S>, SimpleSocketImplementTuple<S>> {
    protected abstract _instanceClient: S;
    constructor();
    protected socketmount<T extends () => void>(callback: CallBackSimpleSocket<S>): T;
    protected socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: CallBackSimpleSocketData<S>): T;
}
export type WebHolder = net.Socket | TLSSocket;
export type WebSocketHolderSocketImplementTupleData<S extends WebHolder> = [Server.ResponseData | Server.RequestData, S, webSocketServer];
export type WebSocketHolderSocketImplementTuple<S extends WebHolder> = [S, webSocketServer];
export type CallBackWebSocketHolderData<S extends WebHolder> = (...args: WebSocketHolderSocketImplementTupleData<S>) => void;
export type CallBackWebSocketHolder<S extends WebHolder> = (...args: WebSocketHolderSocketImplementTuple<S>) => void;
declare abstract class WebSocketHolder<S extends WebHolder> extends SocketSingleTone<WebSocketHolderSocketImplementTupleData<S>, WebSocketHolderSocketImplementTuple<S>> implements Server.Socket<WebSocketHolderSocketImplementTupleData<S>, WebSocketHolderSocketImplementTuple<S>> {
    protected _instanceWebSocket: webSocketServer;
    protected abstract _instanceClient: S;
    constructor(websocketPort: Server.Port);
    protected socketmount<T extends () => void>(callback: CallBackWebSocketHolder<S>): T;
    protected socketmountData<T extends (data: Buffer<ArrayBufferLike>) => void>(callback: CallBackWebSocketHolderData<S>): T;
    protected createWebSocketConnection(websocketPort: Server.Port): webSocketServer;
}
export declare class SocketTree extends SimpleSocket<internal.Duplex> {
    private static _instance;
    protected _instanceClient: internal.Duplex;
    private constructor();
    static getInstance(socket?: internal.Duplex): SocketTree;
    writeToSocket(value: string): void;
}
export declare class TCPServerSingleTone extends WebSocketHolder<net.Socket> {
    static readonly UpgratedProtocole: string;
    private static _instance;
    protected _instanceClient: net.Socket;
    private constructor();
    private createConnection;
    static getInstance(port: Server.Port, webSocketPort: Server.Port): TCPServerSingleTone;
}
declare const TLSClientSingleTone_base: (abstract new (...args: any[]) => {
    createConnection(port: Server.Port, host: string): TLSSocket;
    setData(callBack: (...A: SimpleSocketImplementTupleData<tls.TLSSocket> | WebSocketHolderSocketImplementTupleData<tls.TLSSocket>) => void): void;
    setConnection(callBack: (...args: SimpleSocketImplementTuple<tls.TLSSocket> | WebSocketHolderSocketImplementTuple<tls.TLSSocket>) => void): void;
    setClose(callBack: (...args: SimpleSocketImplementTuple<tls.TLSSocket> | WebSocketHolderSocketImplementTuple<tls.TLSSocket>) => void): void;
    setError(callBack: (Error: Error) => void): void;
    setEnd(callBack: (...args: SimpleSocketImplementTuple<tls.TLSSocket> | WebSocketHolderSocketImplementTuple<tls.TLSSocket>) => void): void;
}) & (abstract new (websocketPort: Server.Port) => WebSocketHolder<tls.TLSSocket>);
export declare class TLSClientSingleTone extends TLSClientSingleTone_base {
    private static _instance;
    protected _instanceClient: tls.TLSSocket;
    private constructor();
    static getInstance(port: Server.Port, host: string, webSocketPort: Server.Port): TLSClientSingleTone;
}
export type httpsServerArgs = {
    port: Server.Port;
    server: http.Server;
    host: string;
    certificate: Server.httpsCertificate;
};
declare const TLSServerSingleTone_base: (abstract new (...args: any[]) => {
    createConnection(port: Server.Port, host: string): TLSSocket;
    setData(callBack: (...A: SimpleSocketImplementTupleData<tls.TLSSocket> | WebSocketHolderSocketImplementTupleData<tls.TLSSocket>) => void): void;
    setConnection(callBack: (...args: SimpleSocketImplementTuple<tls.TLSSocket> | WebSocketHolderSocketImplementTuple<tls.TLSSocket>) => void): void;
    setClose(callBack: (...args: SimpleSocketImplementTuple<tls.TLSSocket> | WebSocketHolderSocketImplementTuple<tls.TLSSocket>) => void): void;
    setError(callBack: (Error: Error) => void): void;
    setEnd(callBack: (...args: SimpleSocketImplementTuple<tls.TLSSocket> | WebSocketHolderSocketImplementTuple<tls.TLSSocket>) => void): void;
}) & (abstract new () => SimpleSocket<tls.TLSSocket>);
export declare class TLSServerSingleTone extends TLSServerSingleTone_base implements Server.HttpsServerSocket<SimpleSocketImplementTupleData<TLSSocket>, SimpleSocketImplementTuple<TLSSocket>> {
    private static _instance;
    private _instanceTlsServer;
    protected _instanceClient: TLSSocket;
    private constructor();
    static getInstance({ port: port, server: http, host: host, certificate: certificate }: httpsServerArgs): TLSServerSingleTone;
    private createServeur;
    listen(port: Server.Port, callBack: () => void): void;
}
export {};
