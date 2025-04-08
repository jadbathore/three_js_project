// export class CompilerWatchSubject implements LibFile.Subject {
//     public observers:LibFile.Observer[] = []

//     public attach(observer: LibFile.Observer): void {
//         if(!this.observers.includes(observer))
//         {
//             this.observers.push(observer)
//         }
//     }
    

//     public detach(observer: LibFile.Observer): void {
//         const obeserverIndex:number = this.observers.indexOf(observer)
//         if(obeserverIndex === -1)
//         {
//             throw Error(`observer do not exist (on CompilerWatchSubject)`)
//         }
//         const ObserverToDetach:LibFile.Observer = this.observers[obeserverIndex];
//         Object.defineProperty(ObserverToDetach,'push',{
//             writable: false,
//             configurable: false
//         })
//         this.observers.splice(obeserverIndex,1)
//     }

//     public async notify(event:EventFile):Promise<void>
//     {
//         for (const observer of this.observers){
//             const iterator:AsyncGenerator<any, any, unknown> = observer.update(this,event)
//             for await (const IteratorResult of iterator){
//                 IteratorResult
//             }
//         }
//     }
    
//     public addEventObserver(observer:LibFile.Observer,eventPromise:EventPromise):Awaited<void>
//     {
//         eventPromise.then((event:EventFile)=>{
//             observer.addEvent(event)
//         })
//     } 

// }
// //___________________________
// export class ObserverWatch implements LibFile.Observer {
//     private _events:EventFile[]=[];
//     private readonly _path:string;
//     private readonly _proxyHandler:ProxyHandler<EventFile[]>

//     public constructor(path:string)
//     {
//         this._path = path
//         this._proxyHandler = this.setFristLayerProxyHandler(); 
//     }

//     public async *update(subject: LibFile.Subject,event:EventFile):AsyncGenerator<any, any, EventPromise>
//     {
//         const emitPromise:EventPromise =  new Promise((resolve,rejects)=>{
//             resolve(event)
//         })
//         yield subject.addEventObserver(this,emitPromise)
//     }

//     private setFristLayerProxyHandler():ProxyHandler<EventFile[]>
//     {
//         return {
//             get:function(target:EventFile[], p:string, receiver:any)
//             {
//                 if(p){
//                     const index:number = parseInt(p)
//                     return target[index]
//                 }
//                 return target
//             },
//             set:function(target:EventFile[],p:string,newvalue:any,receiver:any):boolean{
//                 const index:number = parseInt(p)
//                 target[index] = newvalue
//                 return true
//             }
//         }
//     }
//     private setSecondLayerProxyHandler():ProxyHandler<EventFile[]>
//     {
//         return {
//             get:function(target:EventFile[], p:string|symbol, receiver:any)
//             {
//                 return target
//             },
//             set:function(target:EventFile[],p:string,newvalue:any,receiver:any):boolean{
//                 const index:number = parseInt(p)
//                 target[index] = newvalue
//                 return true
//             }
//         }
//     }

//     public addEvent(event:EventFile):void
//     {
//         this._events.push(event)
//     }

//     get events():EventFile[]
//     {
//         return this._events
//     }

//     get path():string
//     {
//         return this._path;
//     }
    
//     get proxyHandler():ProxyHandler<EventFile[]>
//     {
//         return this._proxyHandler;
//     }

// }


// export function ProxyObserver(observer:LibFile.Observer,callBack:(event:EventFile,path:String)=>void):void
// {
//     const _array:EventFile[] =[]
//     const ProxyObserver:EventFile[] = new Proxy<EventFile[]>(observer.events,observer.proxyHandler)


//     Object.defineProperty(ProxyObserver,'push', 
//         {
//             value: function():void
//             {
//                 _array.push(...arguments)
//                 callBack(arguments[0],observer.path)
//             },
//             writable: true,
//             configurable: true
//     })
// }
