type EventFile = {
    eventType:string;
    filename:string;
}
type EventPromise = Promise<EventFile>

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


