type Event = {
    eventType:string;
    filename:string;
}

type EventPromise = Promise<Event>

interface Subject {
    attach(observer:Observer):void;
    detach(observer:Observer):void;
    getChange(event:Event):void;
    addEventObserver(observer:Observer,eventPromise:EventPromise):void
}

interface Observer {
    update(subject:Subject,event:Event):AsyncGenerator<any, any, unknown>;
    addEvent(event:Event):void;
    get events():Event[]
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

    public async getChange(event:Event):Promise<void>
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
    private _events:Event[]=[]

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
}

const subject = new CompilerWatchSubject()
const observer = new ObserverWatch()

const EventsHandler:ProxyHandler<Event[]> = {
    get:function(target:Event[], p:string, receiver:any)
    {
        if(p){
            const index:number = parseInt(p)
            return target[index]
        }
        return target
    }
}

const testProxy:Event[] = new Proxy<Event[]>(observer.events,EventsHandler)

Object.defineProperty(testProxy,'push', 
    {
        value: function():void
        {
            
        },
        writable: false,
    })

const funcTest = async(observer:Observer) =>
{
    subject.attach(observer)
    await subject.getChange({eventType:'change',filename:'baba.js'})
    await subject.getChange({eventType:'change',filename:'baba1.js'})
    await subject.getChange({eventType:'change',filename:'baba2.js'})
    setTimeout(async()=>{
        await subject.getChange({eventType:'change',filename:'baba3.js'})
    },1000)
}

funcTest(observer);




