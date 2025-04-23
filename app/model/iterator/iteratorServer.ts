import type { AppRouter } from "../../route/routeur.js"
import { Compiler } from "../CompilerSetUp/Compiler.js";
import { ObserverWatch } from "../oberserver/oberserver.js";

export class IteratorServer implements Server.Iterator<AppRouter> {
    private _collection: Server.Aggregator<AppRouter>;
    private _index: number;
    private _reverse: boolean = false;

    constructor(collection: Server.Aggregator<AppRouter>,reverse: boolean = false) {
        this._collection = collection;
        this._reverse = reverse;
        this._index = this._collection.getExtremity(!reverse);
    }

    public rewind() {
        this._index = this._collection.getExtremity(!this._reverse);
    }

    public current(): AppRouter {
        return this._collection.getItems()[this._index];
    }

    public addCompilerTuple(subject:LibFile.Subject): void {
        const item:AppRouter = this.current();
        const oberserver:LibFile.Observer = new ObserverWatch (
            item.pathServer
        )
        const compiler:Compiler = new Compiler(oberserver,subject,item.scene)
        this._collection.getItems()[this._index].CompilerTuple = [compiler,oberserver]
    }
    
    public next(): void {
        this._index += this._reverse ? -1 : 1;
    }

    public valid(): boolean {
        let afterProcessIsValid :boolean;
        this.next();

        if (this._reverse) {
            afterProcessIsValid = this._index >= this._collection.getExtremity(this._reverse);
        } 
        afterProcessIsValid = this._index <= this._collection.getExtremity(this._reverse);
        return afterProcessIsValid;
    }
}

export class ServerRouteAggregate implements Server.Aggregator<AppRouter> {

    private _items:AppRouter[] = [];

    public constructor(routes:AppRouter[]){
        this._items = routes
    }

    public getCount(): number {
        return this._items.length;
    }
    public getIterator(): Server.Iterator<AppRouter> {
        return new IteratorServer(this);
    }
    public getReverseIterator(): Server.Iterator<AppRouter> {
        return new IteratorServer(this,true);
    }

    public addItem(item:AppRouter): void {
        this._items.push(item);
    }

    public getItems():AppRouter[]{
        return this._items;
    }

    public getItem(itemIdetifier:string):AppRouter{
        return this._items.find(({ pathServer }) => pathServer == itemIdetifier);
    }

    public getExtremity(reverse: boolean): number {
        return (reverse)?0:this._items.length -1;
    }
}
