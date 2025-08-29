type EventFile = {
    eventType:string;
    filename:string;
}
type EventPromise = Promise<EventFile>

type EventProxy = {
    proxy:EventFile[],
    observer:LibFile.Observer,
}

type EventServer<T> = {
    route:string,
    type:T,
}

type serverTarget<REQ> = {
    route:REQ,
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
    type CodeServer = number & {__brand:'CodeServer'}
    interface Headers {
        [key:string]:string;
    }

    type RequestArguments = {
        path:string
        host:string,
        protocole:string,
        method:string,
        headers?:Headers,
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
    interface SocketHandler<T extends route<any,any,any,any,any>,R> {
        handleReconnection({CompilerTuple:[compiler,oberserver]}:T):void;
        handleConnection({CompilerTuple:[compiler,oberserver]}:T,request:R):void;
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

    interface ResponseData {
        get headers():Server.Headers;
        get code():Server.CodeServer;
        get message():string;
        get protocole():string;
        get body():string;
    }
}
