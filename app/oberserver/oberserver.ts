export class CompilerWatchSubject implements LibFile.Subject {
    public observers:LibFile.Observer[] = []

    public attach(observer: LibFile.Observer): void {
        if(!this.observers.includes(observer))
        {
            this.observers.push(observer)
        }
    }
    

    public detach(observer: LibFile.Observer): void {
        const obeserverIndex = this.observers.indexOf(observer)
        if(obeserverIndex === -1)
        {
            throw Error(`observer do not exist (on CompilerWatchSubject)`)
        }
        this.observers.splice(obeserverIndex,1)
    }

    public async notify(event:EventFile):Promise<void>
    {
        for (const observer of this.observers){
            const iterator:AsyncGenerator<any, any, unknown> = observer.update(this,event)
            for await (const IteratorResult of iterator){
                IteratorResult
            }
        }
    }

    public addEventObserver(observer:LibFile.Observer,eventPromise:EventPromise):Awaited<void>
    {
        eventPromise.then((event:EventFile)=>{
            observer.addEvent(event)
        })
    } 

}
//___________________________
export class ObserverWatch implements LibFile.Observer {
    private _events:EventFile[]=[];
    private readonly _path:string;


    public constructor(path:string)
    {
        this._path = path
    }

    public async *update(subject: LibFile.Subject,event:EventFile):AsyncGenerator<any, any, EventPromise>
    {
        const emitPromise:EventPromise =  new Promise((resolve,rejects)=>{
            resolve(event)
        })
        yield subject.addEventObserver(this,emitPromise)
    }

    public addEvent(event:EventFile):void
    {
        this._events.push(event)
    }

    get events():EventFile[]
    {
        return this._events
    }

    get path():string
    {
        return this._path
    }
}

export function ProxyObserver(observer:LibFile.Observer,callBack:(event:EventFile,path:String)=>void):void
{
    const _array:EventFile[] = []

    const raiseEvent = (event:EventFile,path:String) => {
        callBack(event,path)
    }

    const EventsHandler:ProxyHandler<EventFile[]> = {
        get:function(target:EventFile[], p:string, receiver:any)
        {
            if(p){
                const index:number = parseInt(p)
                return target[index]
            }
            return target
        },
        set:function(target:EventFile[],p:string,newvalue:any,receiver:any):boolean{
            const index:number = parseInt(p)
            target[index] = newvalue
            return true
        }
    }
    const ProxyObserver:EventFile[] = new Proxy<EventFile[]>(observer.events,EventsHandler)

    Object.defineProperty(ProxyObserver,'push', 
        {
            value: function():void
            {
                _array.push(...arguments)
                raiseEvent(arguments[0],observer.path)
            },
            writable: true,
            configurable: true
    })
}
