interface Subject {
    attach(observer:Observer):void;
    detach(observer:Observer):void;
    getChange(event:event):void
}

interface Observer {
    update(subject:Subject,event:event):void;
    get eventType():string;
    get filename():string;

}
type event = {
    eventType:string;
    filename:string;
}

class SingleToneEventHistory {
    static #instance:SingleToneEventHistory;
    #events:event[]=[]

    private constructor(){}
    
    public static get instance(): SingleToneEventHistory {
        if (!SingleToneEventHistory.#instance) {
            SingleToneEventHistory.#instance = new SingleToneEventHistory();
        }
        return SingleToneEventHistory.#instance;
    }

    public addEvent(event:event){
        this.#events.push(event)
    }

    public get events():Array<event>{
        return this.#events
    }
}

export class CompilerWatchSubject implements Subject {
    public observers:Observer[]=[]
    private _instanceEvent:SingleToneEventHistory = SingleToneEventHistory.instance

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

    public getChange(event:event): void {
        for(const observer of this.observers){
            observer.update(this,event)
        }
    }

    public addToHistory(event:event){
        this._instanceEvent.addEvent(event)
    }


}

export class ObserverWatch implements Observer {
    private _eventType?:string
    private _fileName?:string

    public get eventType():string{
        return this._eventType
    }

    public get filename():string{
        return this._fileName
    }

    public update(subject: Subject,event:event): void {
        this._eventType = event.eventType;
        this._fileName = event.filename;
        
    }
}


const subject = new CompilerWatchSubject()

const funcTest = () =>
{
    const observer = new ObserverWatch()
    subject.attach(observer)
    subject.getChange({eventType:'change',filename:'baba.js'})
}


funcTest()