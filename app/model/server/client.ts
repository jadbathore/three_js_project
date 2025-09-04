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
// type ClientTupleData = [Server.RequestData|Server.ResponseData, net.Socket, webSocketServer];
// type ClientTuple = [net.Socket, webSocketServer];

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
> 
{
    protected abstract _instanceClient:net.Socket|internal.Duplex|TLSSocket;

    public setData(callBack:(...A:A)=>void):void
    {
        this._instanceClient.on('data',this.socketmountData((...args:A)=>{
            callBack(...args)
        }));
    }

    @oneCall
    public setConnection(callBack:(...args:B)=>void){
        this.setEventCallBack(callBack,'connection')
    }

    @oneCall
    public setClose(callBack:(...args:B)=>void){
        this.setEventCallBack(callBack,'close')
    }

    @oneCall
    public setError(callBack:(...args:B)=>void){
        this.setEventCallBack(callBack,'error')
    }
    

    @oneCall
    public setEnd(callBack:(...args:B)=>void){
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

abstract class SimpleSocket<S extends internal.Duplex|TLSSocket> extends SocketSingleTone<[Server.ResponseData|Server.RequestData,S],[S]> 
{
    protected abstract _instanceClient:S;

    protected constructor(websocketPort:Server.Port){super()}

    protected socketmount<T extends ()=>void>(callback:(...args:[S])=>void):T
    {
        const socket = ()=>{
            callback(this._instanceClient)
        }
        return socket as T
    }
    
    protected socketmountData<T extends (data:Buffer<ArrayBufferLike>)=>void>(callback:(...args:[Server.ResponseData|Server.RequestData,S])=>void):T
    {
        const socket = (data:Buffer<ArrayBufferLike>) =>{
            const dataParse = DataParser.responseOrRequest(data.toString());
            callback(dataParse,this._instanceClient)
        }
        return socket as T
    }
}

abstract class WebSocketHolder<S extends net.Socket|TLSSocket> extends SocketSingleTone<
    [Server.ResponseData|Server.RequestData,S,webSocketServer],
    [S,webSocketServer]
> {
    protected _instanceWebSocket:webSocketServer;
    protected abstract _instanceClient:S;

    protected constructor(websocketPort:Server.Port){
        super()
        this._instanceWebSocket = this.createWebSocketConnection(websocketPort);
    }

    protected socketmount<T extends ()=>void>(callback:(...args:[S,webSocketServer])=>void):T
    {
        const socket = ()=>{
            callback(this._instanceClient,this._instanceWebSocket)
        }
        return socket as T
    }
    
    protected socketmountData<T extends (data:Buffer<ArrayBufferLike>)=>void>(callback:(...args:[Server.ResponseData|Server.RequestData,S,webSocketServer])=>void):T
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
 


type SocketConstructor<
    I extends net.Socket|TLSSocket,
    T = SimpleSocket<I>
> = abstract new (...any:any[]) => T;

type test = (abstract new (websocketPort: Server.Port) => SimpleSocket<internal.Duplex>) & { prototype: SimpleSocket<any>; }
// type test = abstract new (...any:any[]) => SimpleSocket<internal.Duplex>
// type AbstractConstructor<I extends net.Socket|TLSSocket,T = abstract new ()=> SimpleSocket<I>|WebSocketHolder<I>> = new (...args: any[]) => T;
type Constructor<T = test> = new (...args:any[]) => T
function Logger<T extends Constructor>(Base:Tbase) {
    abstract class http extends Base {

        protected abstract _instanceClient:I

        protected constructor(...args:any[]) {
            super(...args);
        }   
    }
    return http
}

class Test extends Logger(SimpleSocket<internal.Duplex>)
{
    protected _instanceClient:S;

    protected constructor (){
        super()
    }
    test(){
        this.log()
    }
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

export class SocketTLS extends SimpleSocket<TLSSocket>
{
    protected _instanceClient:TLSSocket;
    private static _instance:SocketTLS;

    private constructor (){
        super()
        this._instanceClient = this.createConnection()
    }

    public static get instance(): SocketTLS
    {
        if (!SocketTLS._instance) {
            SocketTLS._instance = new SocketTLS();
        }
        return SocketTLS._instance
    } 

    private createConnection():TLSSocket
    {
        const options = {
            host: 'localhost',
            port: 3000,
            servername: 'localhost',
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

export class TLSServerSingleTone extends WebSocketHolder<TLSSocket>
{
    protected _instanceClient:TLSSocket;
    private static _instance:TLSServerSingleTone;
    private _instanceTlsServer:tls.Server;

    private constructor(port:Server.Port,httpsServer:https.Server,websocket:Server.Port)
    {
        super(websocket)
        this._instanceTlsServer = this.createServeur(httpsServer,port);
    }

    private createServeur(httpServer:https.Server,port:Server.Port):tls.Server
    {
        const options = {
            host: 'localhost',
            port: port,
            servername: 'localhost',
            rejectUnauthorized: false,  // self attribute (to change if not)
        };
        const tlsServer = tls.createServer(options, (tlsSocket) => {
            httpServer.emit('connection', tlsSocket);
        }); 
        return tlsServer
    }

    private createConnection(port:Server.Port):tls.TLSSocket
    {
        const options = {
            host: 'localhost',
            port: port,
            servername: 'localhost',
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

    @oneCall
    public listenServer(callBack:()=>void)
    {
        this._instanceTlsServer.listen(callBack)
    }
}



