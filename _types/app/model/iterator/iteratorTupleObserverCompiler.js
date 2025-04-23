export class iteratorTupleObserverCompiler {
    constructor(collection, reverse = false) {
        this._reverse = false;
        this._collection = collection;
        this._reverse = reverse;
        this._index = this._collection.getExtremity(!reverse);
    }
    rewind() {
        this._index = this._collection.getExtremity(this._reverse);
    }
    current() {
        return this._collection.getItems()[this._index];
    }
    next() {
        const item = this.current();
        this._index += this._reverse ? -1 : 1;
        return item;
    }
    valid() {
        if (this._reverse) {
            return this._index >= this._collection.getExtremity(this._reverse);
        }
        return this._index <= this._collection.getExtremity(this._reverse);
    }
}
export class ServerRouteAggregate {
    constructor(routes) {
        this._items = [];
        this._items = routes;
    }
    getCount() {
        return this._items.length;
    }
    getIterator() {
        return new iteratorTupleObserverCompiler(this);
    }
    getReverseIterator() {
        return new iteratorTupleObserverCompiler(this, true);
    }
    addItem(item) {
        this._items.push(item);
    }
    getItems() {
        return this._items;
    }
    getExtremity(reverse) {
        return (reverse) ? 0 : this._items.length - 1;
    }
}
