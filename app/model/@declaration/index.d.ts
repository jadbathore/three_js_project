type EventFile = {
    eventType:string;
    filename:string;
}
type EventPromise = Promise<EventFile>

type EventProxy = {
    proxy:EventFile[],
    observer:LibFile.Observer,
}

type Revokable<T>={
    proxy:T,
    revoke:()=>void
}

type requestedAction<T> = {
    payload:string|null,
    type:T
}


interface Error {
    code:string
}

// Extend Express Request interface to add redirSelf
declare namespace Express {
    interface Request {
        method:string;
        action?:requestedAction<any>
        path:string;
        redir?: (location:string) => void;
    }
    interface Response {
        setHeader(header:string,value:string):void;
    }
}


declare namespace Compiler {
    type double = {
        double:string,
        uniqueArray:string[]
    }
    type declarations = {
        variableDeclaration:string[],
        constant:string[],
        functionName:string[],
        allClassName:string[]
    }
    type classDeclaration = {
        paramClass: string, 
        constant: string
    }
    type errorNamespace = {
        double:double,
        data:any,
        clean:String[],
        objNameSpace:string,
    }
    type remplace = {
        data:Object,
        cleanText:string
    }
    type rawvalue = {
        [x:string]:string
    }
    type rawvalueContainer = {
        [x:string]:rawvalue
    }
}

declare namespace LibFile {

    interface Subject {
        attach(observer:Observer):void;
        detach(observer:Observer):void;
        notify(event:EventFile):void;
        addEventObserver(observer:Observer,eventPromise:EventPromise):void
    }
    
    interface Observer {
        addEvent(event:EventFile):void;
        update(subject:Subject,event:EventFile):AsyncGenerator<any, any, unknown>;
        get events():EventFile[];
        get path():string;
        get firstLayerproxyHandler():ProxyHandler<EventFile[]>;
        get secondLayerproxyHandler():ProxyHandler<EventProxy>;
    }

    interface ProxyDirObserver {
        ProxyBehavior(callBack?:(event:EventFile,path:String)=>void):void;
        proxyRevoke():void;
        test():void;
    }


}

declare namespace Cache {
    interface versionInterface{
        versionName:string,
        name:string,
        date:{ type: DateConstructor; default: () => number; },
        content:string
    }
    interface singleInterface{
        versionName:string,
        name:string,
        date:{ type: DateConstructor; default: () => number; },
        content:string
    }
    interface imageInterface {
        get url(): string;
    }
}

declare namespace Server {

    type Port = number & {__brand:'Port'};
    type CodeServer = number & {__brand:'CodeServer'};
    type Path = string & {__brand:'Path'};

    type InstanceClientCallBack<T extends [...any]> = (...args:T)=>void & {__brand:'InstanceClientCallBack'};
    type InstanceClientCallBackData<T extends [Server.ResponseData|Server.RequestData,...any] > = (...args:T)=>void & {__brand:'InstanceClientCallBack'};
    type serverTarget = { route:string };
    type EventServer<T> = serverTarget & { type:T };
    type webSocketEvent = { event:string , payload:string}

    interface Headers {
        [key:string]:string;
    }

    interface handlerCode {
        [index:string]:()=>void
    }

    type CommArgument = {
        body?:string,
        headers?:Server.Headers,
        protocole:string
    }

    type RequestArguments = CommArgument & {
        path:Server.Path
        host:string,
        method:string,
    }

    type ResponseArguments = CommArgument & {
        code:Server.CodeServer,
        message:string
    }

    interface revocable<T extends Object>{
        proxy:typeof Proxy<T>,
        revoke:()=>void
    }

    type route<REQ,RES,NEXT,METHODS,COMPILER> = {
        pathServer?:string;
        method:METHODS;
        scene?:string;
        serverLogic:(
            req: REQ,
            res: RES, 
            next?: NEXT
        )=> void;
        CompilerTuple?: [COMPILER,LibFile.Observer,LibFile.ProxyDirObserver];
    }
    interface SocketHandler<T extends route<any,any,any,any,any>> {
        handleReconnection({CompilerTuple:[compiler,oberserver]}:T):void;
        handleConnection({CompilerTuple:[compiler,oberserver]}:T):void;
        handleDeconnection({CompilerTuple:[compiler,oberserver]}:T):void;
    }
    type OptionStatic = {
        dotfiles: string,
        etag: boolean,
        index: boolean,
        redirect: boolean,
        maxAge: string,
        extensions:string[];
        setHeaders?:(res:any,path:string,stat:any)=>void
    }
    interface Collection<T>{
        get collection():T[];
    }
    interface Iterator<T>{
        current():T;
        next():void;
        rewind():void;
        valid():boolean;
        addCompilerTuple(subject:LibFile.Subject):void;
    }
    interface Aggregator<T>{
        getReverseIterator():Iterator<T>
        getIterator():Iterator<T>;
        addItem(item:T):void;
        getCount():number;
        getItems():T[];
        getItem(itemIdetifier:string):T;
        getExtremity(reverse:boolean):number;
    }

    interface Strategy {
        doAlgorithm(...arguments:any[]): void;
    }

    interface Data {
        get headers():Server.Headers;
        get protocole():string;
        get body():string
    }

    interface ResponseData extends Data {
        get code():Server.CodeServer;
        get message():string;
        get response():string
    }

    interface RequestData extends Data {
        get path():Server.Path
        get host():string;
        get methods():string;
        get request():string
    }

    interface Socket<A extends any[],B extends any[]> {
        setData(callBack:(...A:A)=>void):void;
        setConnection(callBack:(...args:B)=>void):void;
        setClose(callBack:(...args:B)=>void):void;
        setError(callBack:(Error:Error)=>void):void;
        setEnd(callBack:(...args:B)=>void):void;
    }

    interface HttpsServerSocket<A extends any[],B extends any[]> extends Socket<A,B> 
    {
        listen(port:Server.Port,callBack:()=>void):void
    }

    type httpsCertificate = {
        key:Buffer,
        cert:Buffer
    }
}
