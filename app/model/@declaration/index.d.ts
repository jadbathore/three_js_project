type EventFile = {
    eventType:string;
    filename:string;
}
type EventPromise = Promise<EventFile>

type EventProxy = {
    proxy:EventFile[],
    observer:LibFile.Observer,
    set?:boolean
}

type EventServer<T> = {
    route:string,
    type:T,
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
        update(subject:Subject,event:EventFile):AsyncGenerator<any, any, unknown>;
        addEvent(event:EventFile):void;
        get events():EventFile[];
        get path():String;
        get firstLayerproxyHandler():ProxyHandler<EventFile[]>
        get secondLayerproxyHandler():ProxyHandler<EventProxy>
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

    interface revocable<T extends Object>{
        proxy:typeof Proxy<T>,
        revoke:()=>void
    }

    type route<REQ,RES,NEXT,METHODS> = {
        pathServer?:string;
        method:METHODS;
        scene?:string;
        serverLogic:(
            req: REQ,
            res: RES, 
            next?: NEXT
        )=> void;
    }
    type OptionStatic = {
        dotfiles: string,
        etag: boolean,
        index: boolean,
        redirect: boolean,
        maxAge: string,
        setHeaders?:(res:any,path:string)=>void
    }
    interface Collection<T>{
        get collection():T[];
    }
    interface Iterator<T>{
        current():T;
        next():T;
        rewind():void;
        valid():boolean;
    }
    interface Aggregator<T>{
        getReverseIterator():Iterator<T>
        getIterator():Iterator<T>;
        addItem(item:T):void;
        getCount():number;
        getItems():T[];
        getExtremity(reverse:boolean):number;
    }

    interface Strategy {
        doAlgorithm(...arguments:any[]): void;
    }
}


