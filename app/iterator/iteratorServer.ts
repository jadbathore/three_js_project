import type { route } from "../route/routeur.js"


export class IteratorServer implements Server.Iterator<route> {
    private _collection: Server.Aggregator<route>;
    private _index: number;
    private _reverse: boolean = false;

    constructor(collection: Server.Aggregator<route>,reverse: boolean = false) {
        this._collection = collection;
        this._reverse = reverse;
        this._index = this._collection.getExtremity(!reverse);

    }

    public rewind() {
        this._index = this._collection.getExtremity(this._reverse);
    }

    public current(): route {
        return this._collection.getItems()[this._index];
    }

    public next(): route {
        const item = this.current();
        this._index += this._reverse ? -1 : 1;
        return item;
    }

    public valid(): boolean {
        if (this._reverse) {
            return this._index >= this._collection.getExtremity(this._reverse);
        }
        return this._index <= this._collection.getExtremity(this._reverse);
    }
}

export class ServerRouteAggregate implements Server.Aggregator<route> {

    private _items:route[] = [];

    public constructor(routes:route[]){
        this._items = routes
    }

    public getCount(): number {
        return this._items.length;
    }
    public getIterator(): Server.Iterator<route> {
        return new IteratorServer(this);
    }
    public getReverseIterator(): Server.Iterator<route> {
        return new IteratorServer(this,true);
    }

    public addItem(item:route): void {
        this._items.push(item);
    }

    public getItems():route[]{
        return this._items;
    }

    public getExtremity(reverse: boolean): number {
        return (reverse)?0:this._items.length -1;
    }
}


// const collection:Server.Aggregator<string> = new WordsCollection();
// collection.addItem('First');
// collection.addItem('Second');
// collection.addItem('Third');
// console.log(collection.getExtremity(false));

// const reverseIterator:Server.Iterator<string> = collection.getIterator();
// while (reverseIterator.valid()) {
//     console.log(reverseIterator.next());
// }