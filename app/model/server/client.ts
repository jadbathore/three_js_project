import net from 'net'
import http from 'http'
import https from 'https'
import{ DataParser, RequestParser, ResponseParser } from './headParser.js'
import tls, { TLSSocket } from 'tls'
import ws from 'ws'
import internal from 'stream';
import exp from 'constants'
import { Connection } from 'mongoose'


export type webSocketServer = ws.Server<typeof ws, typeof http.IncomingMessage>

// type ServerTupleData = [Server.RequestData|Server.ResponseData,internal.Duplex];
// type ServerTuple = [internal.Duplex];
type ClientTupleData = [Server.RequestData|Server.ResponseData, net.Socket, webSocketServer];
type ClientTuple = [net.Socket, webSocketServer];

type TupleData = [Server.ResponseData|Server.RequestData,net.Socket|internal.Duplex,...any];
type TupleInstance = [net.Socket|internal.Duplex,...any]

// export type CallBackClient = Server.InstanceClientCallBack<ClientTuple>
// export type CallBackClientData = Server.InstanceClientCallBackData<ClientTupleData>

// export type CallBackServer = Server.InstanceClientCallBack<ServerTuple>
// export type CallBackServerData = Server.InstanceClientCallBack<ServerTupleData>

const _array:string[] = []

function oneCall(_:any, propertyKey:string,descriptor:PropertyDescriptor){
    const orginalMethod = descriptor.value;
    descriptor.value = function (...args:any[]){
        if (!_array.includes(propertyKey)){
            _array.push(propertyKey)
            return orginalMethod.apply(this,args)
        }
    }
}

abstract class SocketSingleTone<
    A extends TupleData,
    B extends TupleInstance
> implements Server.Socket<TupleData,TupleInstance>
{
    protected abstract _instanceClient:net.Socket|internal.Duplex|TLSSocket;

    public setData(callBack:(...A:A)=>void):void
    {
        this._instanceClient.on('data',this.socketmountData((...args:A)=>{
            callBack(...args)
        }));
    }

    @oneCall
    public setConnection(callBack:(...args:B)=>void)
    {
        this.setEventCallBack(callBack,'connection')
    }

    @oneCall
    public setClose(callBack:(...args:B)=>void)
    {
        this.setEventCallBack(callBack,'close')
    }

    @oneCall
    public setError(callBack:(error:Error)=>void)
    {
        this._instanceClient.on('error',callBack)
    }
    

    @oneCall
    public setEnd(callBack:(...args:B)=>void)
    {
        this.setEventCallBack(callBack,'end')
    }

    protected setEventCallBack(callBack:(...args:B)=>void,event:string){
        this._instanceClient.on(event,this.socketmount((...args:B)=>{
            callBack(...args)
        }))
    }
    protected  abstract socketmountData<T extends (data:Buffer<ArrayBufferLike>)=>void>(callback:(...args:A)=>void):T
    protected  abstract socketmount<T extends ()=>void>(callback:(...args:B)=>void):T
}

type Simple = internal.Duplex|TLSSocket;
export type SimpleSocketImplementTupleData<S extends Simple> = [Server.ResponseData|Server.RequestData,S];
export type SimpleSocketImplementTuple<S extends Simple> = [S];
export type CallBackSimpleSocketData<S extends Simple> = (...args:SimpleSocketImplementTupleData<S>)=>void;
export type CallBackSimpleSocket<S extends Simple> = (...args:SimpleSocketImplementTuple<S>)=>void;

abstract class SimpleSocket<S extends Simple> extends SocketSingleTone<SimpleSocketImplementTupleData<S>,SimpleSocketImplementTuple<S>>
implements Server.Socket<SimpleSocketImplementTupleData<S>,SimpleSocketImplementTuple<S>>
{
    protected abstract _instanceClient:S;

    public constructor(){super()}

    protected socketmount<T extends ()=>void>(callback:CallBackSimpleSocket<S>):T
    {
        const socket = ()=>{
            callback(this._instanceClient)
        }
        return socket as T
    }
    
    protected socketmountData<T extends (data:Buffer<ArrayBufferLike>)=>void>(callback:CallBackSimpleSocketData<S>):T
    {
        const socket = (data:Buffer<ArrayBufferLike>) =>{
            const dataParse = DataParser.responseOrRequest(data.toString());
            callback(dataParse,this._instanceClient)
        }
        return socket as T
    }
}

type WebHolder = net.Socket|TLSSocket;
type WebSocketHolderSocketImplementTupleData<S extends WebHolder > = [Server.ResponseData|Server.RequestData,S,webSocketServer];
type WebSocketHolderSocketImplementTuple<S extends WebHolder > = [S,webSocketServer];
type CallBackWebSocketHolderData<S extends WebHolder> = (...args:WebSocketHolderSocketImplementTupleData<S>)=>void;
type CallBackWebSocketHolder<S extends WebHolder> = (...args:WebSocketHolderSocketImplementTuple<S>)=>void;

abstract class WebSocketHolder<S extends WebHolder>
extends SocketSingleTone<WebSocketHolderSocketImplementTupleData<S>,WebSocketHolderSocketImplementTuple<S>> 
implements Server.Socket<WebSocketHolderSocketImplementTupleData<S>,WebSocketHolderSocketImplementTuple<S>>
{
    protected _instanceWebSocket:webSocketServer;
    protected abstract _instanceClient:S;

    public constructor(websocketPort:Server.Port){
        super()
        this._instanceWebSocket = this.createWebSocketConnection(websocketPort);
    }

    protected socketmount<T extends ()=>void>(callback:CallBackWebSocketHolder<S>):T
    {
        const socket = ()=>{
            callback(this._instanceClient,this._instanceWebSocket)
        }
        return socket as T
    }
    
    protected socketmountData<T extends (data:Buffer<ArrayBufferLike>)=>void>(callback:CallBackWebSocketHolderData<S>):T
    {
        const socket = (data:Buffer<ArrayBufferLike>) =>{
            const dataParse = DataParser.responseOrRequest(data.toString());
            callback(dataParse,this._instanceClient,this._instanceWebSocket)
        }
        return socket as T
    }

    protected createWebSocketConnection(websocketPort:Server.Port):webSocketServer
    {
        return new ws.Server({ port: websocketPort });
    }
}

type AbstractConstructor<T = {}> = abstract new (...args:any[]) => T
type SocketUsingHttps = Server.Socket<
    SimpleSocketImplementTupleData<TLSSocket>|WebSocketHolderSocketImplementTupleData<TLSSocket>,
    SimpleSocketImplementTuple<TLSSocket>|WebSocketHolderSocketImplementTuple<TLSSocket>
>

function httpsMixin<Tbase extends AbstractConstructor<SocketUsingHttps>>(Base:Tbase)
{
    abstract class Https extends Base
    {
        protected constructor(...args:any[]) {
            super(...args);
        }  
        
        createConnection(port:Server.Port,host:string):TLSSocket
        {
            const options = {
                host: host,
                port: port,
                servername: host,
                rejectUnauthorized: false,  // self attribute (to change if not)
            };
            const socket = tls.connect(options, () => {
            console.log('TLS connected');
            const requestArgs:Server.RequestArguments = {
                method:'GET',
                path:DataParser.tryPath("/"),
                host:'localhost',
                protocole:"HTTP/1.1",
                headers:{
                    Connection:'close'
                }
            }
            const requestParse = new RequestParser(requestArgs);
            socket.write(requestParse.request);
            });
            return socket;
        }
    }
    return Https
}


export class SocketTree extends SimpleSocket<internal.Duplex> 
{
    private static _instance:SocketTree;
    protected _instanceClient:internal.Duplex;

    private constructor (socket:internal.Duplex){
        super()
        this._instanceClient = socket;
    }

    public static getInstance(socket?:internal.Duplex): SocketTree 
    {
        if (!SocketTree._instance && socket) {
            SocketTree._instance = new SocketTree(socket);
        }
        return SocketTree._instance
    } 

    public writeToSocket(value:string)
    {
        this._instanceClient.write(value)
    }
}

export class TCPServerSingleTone extends WebSocketHolder<net.Socket>
{
    public static readonly UpgratedProtocole:string = 'THREE-FOR-THREE';
    private static _instance:TCPServerSingleTone;
    protected _instanceClient:net.Socket;

    private constructor(port:Server.Port,websocket:Server.Port)
    {
        super(websocket)
        this._instanceClient = this.createConnection(port);
    }

    private createConnection(port:Server.Port):net.Socket
    {
        const client = net.createConnection({port:port},()=>{
        const requestHeader:Server.RequestArguments = {
                method:'GET',
                path:DataParser.tryPath('/'),
                protocole:'HTTP/1.1',
                host:'localhost',
                headers:{
                    'Connection':'Upgrade',
                    'Upgrade':'tree-for-three',
                    'key-tree':process.env.PASSWORD_TCP,
                },
            }
            const requestParse = new RequestParser(requestHeader)
            client.write(requestParse.request)
        })
        return client;
    }

    public static getInstance(port:Server.Port,webSocketPort:Server.Port): TCPServerSingleTone {
        if (!TCPServerSingleTone._instance) {
            TCPServerSingleTone._instance = new TCPServerSingleTone(port,webSocketPort);
        }
        return TCPServerSingleTone._instance;
    } 
}

export class TLSClientSingleTone extends httpsMixin(WebSocketHolder<TLSSocket>)
{
    private static _instance:TLSClientSingleTone;
    protected _instanceClient: tls.TLSSocket;

    private constructor(port:Server.Port,host:string,webSocketPort:Server.Port){
        super(webSocketPort)
        this._instanceClient = this.createConnection(port,host)
    }

    public static getInstance(port:Server.Port,host:string,webSocketPort:Server.Port): TLSClientSingleTone
    {
        if (!TLSClientSingleTone._instance) {
            TLSClientSingleTone._instance = new TLSClientSingleTone(port,host,webSocketPort);
        }
        return TLSClientSingleTone._instance
    } 
}

export type httpsServerArgs = {
    port:Server.Port,
    server:http.Server,
    host:string,
    certificate:Server.httpsCertificate
}

export class TLSServerSingleTone extends httpsMixin(SimpleSocket<TLSSocket>) 
implements Server.HttpsServerSocket<SimpleSocketImplementTupleData<TLSSocket>,SimpleSocketImplementTuple<TLSSocket>>
{
    private static _instance:TLSServerSingleTone;
    private _instanceTlsServer:tls.Server;
    protected _instanceClient:TLSSocket;

    private constructor(port:Server.Port,httpServer:http.Server,host:string,certificate:Server.httpsCertificate)
    {
        super()
        this._instanceClient = this.createConnection(port,host)
        this._instanceTlsServer = this.createServeur(httpServer,certificate);
    }

    public static getInstance({port:port,server:http,host:host,certificate:certificate}:httpsServerArgs): TLSServerSingleTone {
        if (!TLSServerSingleTone._instance) {
            TLSServerSingleTone._instance = new TLSServerSingleTone(port,http,host,certificate);
        }
        return TLSServerSingleTone._instance;
    } 

    private createServeur(httpServer:http.Server,certificate:Server.httpsCertificate):tls.Server
    {
        const tlsServer = tls.createServer(certificate, (tlsSocket) => {
            httpServer.emit('connection', tlsSocket);
        }); 
        return tlsServer
    }

    @oneCall
    public listen(port:Server.Port,callBack:()=>void):void
    {
        this._instanceTlsServer.listen(port,callBack)
    }
}
