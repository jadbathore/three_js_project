export class CompilerWatchSubject implements LibFile.Subject {
    public observers:LibFile.Observer[] = []

    public attach(observer: LibFile.Observer): void {
        if(!this.observers.includes(observer))
        {
            this.observers.push(observer)
        }
    }
    

    public detach(observer: LibFile.Observer): void {
        const obeserverIndex:number = this.observers.indexOf(observer)
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

export class ObserverWatch implements LibFile.Observer {
    private _events:EventFile[]=[];
    private readonly _path:string;
    private readonly _firstLayerProxyHandler:ProxyHandler<EventFile[]>
    private readonly _secondLayerProxyHandler:ProxyHandler<EventProxy>

    public constructor(path:string)
    {
        this._path = path
        this._firstLayerProxyHandler = this.setFirstLayerProxyHandler(); 
        this._secondLayerProxyHandler = this.setSecondLayerProxy(); 
    }

    public async *update(subject: LibFile.Subject,event:EventFile):AsyncGenerator<any, any, EventPromise>
    {
        const emitPromise:EventPromise =  new Promise((resolve,rejects)=>{
            resolve(event)
        })
        yield subject.addEventObserver(this,emitPromise)
    }

    private setFirstLayerProxyHandler():ProxyHandler<EventFile[]>
    {
        return {
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
    }

    private setSecondLayerProxy():ProxyHandler<EventProxy>
    {
        return {
            get:function(...args:[EventProxy,string|symbol,any])
            {
                return Reflect.get(...args)
            },
            deleteProperty(...args:[EventProxy,string|symbol]){
                console.log("test")
                return Reflect.deleteProperty(...args)
            }
            
        }
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
        return this._path;
    }
    
    get firstLayerproxyHandler():ProxyHandler<EventFile[]>
    {
        return this._firstLayerProxyHandler;
    }

    get secondLayerproxyHandler():ProxyHandler<EventProxy>
    {
        return this._secondLayerProxyHandler;
    }

}


export function proxyObserver(observer:LibFile.Observer,callBack?:(event:EventFile,path:String,selfProxy:EventFile[])=>void)
{
    const _array:EventFile[] = []
    const ProxyObserver:EventFile[] = new Proxy<EventFile[]>(observer.events,observer.firstLayerproxyHandler)
    Object.defineProperty(ProxyObserver,'push', 
        {
            value: function():void
            {
                _array.push(...arguments)
                callBack(arguments[0],observer.path,this)
            },
            writable: true,
            configurable: true
    })
    return ProxyObserver;
}

export function proxyRevokeCall(proxy:EventFile[],observer:LibFile.Observer){
    const objRevokableProxy:EventProxy = {proxy:proxy,observer:observer}
    const secondLayerProxy = Proxy.revocable(objRevokableProxy,observer.secondLayerproxyHandler)
    Object.defineProperty(proxy,'push',{
        writable: false,
        configurable: false
})
    Object.defineProperty(secondLayerProxy,'revoke',{
        value:():void=>{
            delete objRevokableProxy.proxy; 
            delete objRevokableProxy.observer;      
        },
    })
    return secondLayerProxy
}