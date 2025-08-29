export class proxyObserver implements LibFile.ProxyDirObserver {

    // l'observer 
    private _observer:LibFile.Observer;
    // la proxy de l'observer events
    private _firstLayerProxy:EventFile[];
    private _proxy:Revokable<EventProxy>;
    /**
     * @param observer correspond à l'observer relier à cette proxy 
     */
    public constructor(observer:LibFile.Observer){
        this._observer = observer;
        //creation de la proxy de cette observer 
        this._firstLayerProxy = new Proxy(observer.events,observer.firstLayerproxyHandler);
        this._proxy = this.proxyRevokeable(this._firstLayerProxy);
    }


    /**
     * @param callBack creation d'une certaine logique selon un callback defini 
     *  event = le nouvelle event novellement ajouter 
     *  path = correspond au chemin utilisé par l'observer
     */
    public ProxyBehavior(callBack:(event:EventFile,path:String)=>void):void
    {
        const _array:EventFile[] = []
        Object.defineProperty(this._proxy.proxy,'push', 
            {
                value: function():void
                {
                    _array.push(...arguments)
                    callBack(arguments[0],this._observer.path)
                },
                writable: true,
                configurable: true
        })   
    }

    public test(){
        console.log("hello")
    }


    /**
     * function permettant de revoker le proxy grace à la second 
     */
    public proxyRevokeable(proxy:EventFile[]):Revokable<EventProxy>
    {
        const objRevokableProxy:EventProxy = {proxy:proxy,observer:this._observer}
        const secondLayerProxy = Proxy.revocable(objRevokableProxy,this._observer.secondLayerproxyHandler)
        Object.defineProperty(secondLayerProxy,'revoke',{
            value:():void=>{
                delete objRevokableProxy.proxy; 
                delete objRevokableProxy.observer;      
            },
        })
        return secondLayerProxy
    }

    public proxyRevoke()
    {
        this._proxy.revoke()
    }
}




