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

type serverTarget = {
    route:string,
}

type Revokable<T>={
    proxy:T,
    revoke:()=>void
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
    //Subject correspond à la classe qui gère les observers.
    interface Subject {
        // Ajout d’un observer
        attach(observer:Observer):void;
        //Détachement d’un observer
        detach(observer:Observer):void;
        //Notification correspondant à l’appel de l’action sur tous les observers. 
        notify(event:EventFile):void;
        //Élément de logique métier 
        addEventObserver(observer:Observer,eventPromise:EventPromise):void
    }
    
    interface Observer {
        // Élément de logique métier permettant d’ajouter des événements : 
        addEvent(event:EventFile):void;
        // Mettre à jour l’observer
        update(subject:Subject,event:EventFile):AsyncGenerator<any, any, unknown>;
        // Obtenir les actions lier a l'observer
        get events():EventFile[];
        // Obtenir le chemin correspondant à cet observer 
        get path():String;
        // d'avoir le proxy handler de cette observer (en readonly )
        get firstLayerproxyHandler():ProxyHandler<EventFile[]>;
        get secondLayerproxyHandler():ProxyHandler<EventProxy>;
    }

    interface ProxyDirObserver {
        ProxyBehavior(callBack?:(event:EventFile,path:String)=>void):void;
        proxyRevoke():void;
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
}
