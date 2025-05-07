export class proxyObserver implements LibFile.ProxyDirObserver {

    private _observer:LibFile.Observer;
    private _proxy:EventFile[];

    public constructor(observer:LibFile.Observer){
        this._observer = observer;
        this._proxy = new Proxy(observer.events,observer.firstLayerproxyHandler);
    }

    public ProxyBehavior(callBack:(event:EventFile,path:String)=>void):void
    {
        const _array:EventFile[] = []
        Object.defineProperty(this._proxy,'push', 
            {
                value: function():void
                {
                    _array.push(...arguments)
                    callBack(arguments[0],this._observer)
                },
                writable: true,
                configurable: true
        })   
    }


    public proxyRevoke()
    {
        const objRevokableProxy:EventProxy = {proxy:this._proxy,observer:this._observer}
        const secondLayerProxy = Proxy.revocable(objRevokableProxy,this._observer.secondLayerproxyHandler)
        Object.defineProperty(secondLayerProxy,'revoke',{
            value:():void=>{
                delete objRevokableProxy.proxy; 
                delete objRevokableProxy.observer;      
            },
        })
        secondLayerProxy.revoke()
    }
}




