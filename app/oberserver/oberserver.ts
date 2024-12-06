type Event = {
    eventType:string;
    filename:string;
}

type EventPromise = Promise<Event>

interface Subject {
    attach(observer:Observer):void;
    detach(observer:Observer):void;
    notify(event:Event):void;
    addEventObserver(observer:Observer,eventPromise:EventPromise):void
}

interface Observer {
    update(subject:Subject,event:Event):AsyncGenerator<any, any, unknown>;
    addEvent(event:Event):void;
    get events():Event[];
    get path():String;
}

//___________________________
export class CompilerWatchSubject implements Subject {
    public observers:Observer[] = []

    public attach(observer: Observer): void {
        if(!this.observers.includes(observer))
        {
            this.observers.push(observer)
        }
    }

    public detach(observer: Observer): void {
        const obeserverIndex = this.observers.indexOf(observer)
        if(obeserverIndex === -1)
        {
            throw Error(`observer do not exist (on CompilerWatchSubject)`)
        }
        this.observers.splice(obeserverIndex,1)
    }

    public async notify(event:Event):Promise<void>
    {
        for (const observer of this.observers){
            const iterator:AsyncGenerator<any, any, unknown> = observer.update(this,event)
            for await (const IteratorResult of iterator){
                IteratorResult
            }
        }
    }

    public addEventObserver(observer:Observer,eventPromise:EventPromise):Awaited<void>
    {
        eventPromise.then((event:Event)=>{
            observer.addEvent(event)
        })
    } 

}
//___________________________
export class ObserverWatch implements Observer {
    private _events:Event[]=[];
    private _path:string;


    public constructor(path:string)
    {
        this._path = path
    }

    public async *update(subject: Subject,event:Event):AsyncGenerator<any, any, EventPromise>
    {
        const emitPromise:EventPromise =  new Promise((resolve,rejects)=>{
            resolve(event)
        })
        yield subject.addEventObserver(this,emitPromise)
    }

    public addEvent(event:Event):void
    {
        this._events.push(event)
    }

    get events():Event[]
    {
        return this._events
    }

    get path():string
    {
        return this._path
    }
}

export function ProxyObserver(observer:Observer,callBack:(event:Event,path:String)=>void):void
{
    const _array:Event[] = []

    const raiseEvent = (event:Event,path:String) => {
        callBack(event,path)
    }

    const EventsHandler:ProxyHandler<Event[]> = {
        get:function(target:Event[], p:string, receiver:any)
        {
            if(p){
                const index:number = parseInt(p)
                return target[index]
            }
            return target
        },
        set:function(target:Event[],p:string,newvalue:any,receiver:any):boolean{
            const index:number = parseInt(p)
            target[index] = newvalue
            return true
        }
    }
    const ProxyObserver:Event[] = new Proxy<Event[]>(observer.events,EventsHandler)

    Object.defineProperty(ProxyObserver,'push', 
        {
            value: function():void
            {
                _array.push(...arguments)
                raiseEvent(arguments[0],observer.path)
            },
            writable: false,
    })
}