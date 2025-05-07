import { Compiler } from "../CompilerSetUp/Compiler.js";
import { ObserverWatch } from "../oberserver/oberserver.js";
import { proxyObserver } from "../oberserver/proxyObserver.js";
export class IteratorServer {
    constructor(collection, reverse = false) {
        this._reverse = false;
        this._collection = collection;
        this._reverse = reverse;
        this._index = this._collection.getExtremity(!reverse);
    }
    rewind() {
        this._index = this._collection.getExtremity(!this._reverse);
    }
    current() {
        return this._collection.getItems()[this._index];
    }
    addCompilerTuple(subject) {
        const item = this.current();
        const oberserver = new ObserverWatch(item.pathServer);
        const compiler = new Compiler(oberserver, subject, item.scene);
        const proxy = new proxyObserver(oberserver);
        this._collection.getItems()[this._index].CompilerTuple = [compiler, oberserver, proxy];
    }
    next() {
        this._index += this._reverse ? -1 : 1;
    }
    valid() {
        let afterProcessIsValid;
        this.next();
        if (this._reverse) {
            afterProcessIsValid = this._index >= this._collection.getExtremity(this._reverse);
        }
        afterProcessIsValid = this._index <= this._collection.getExtremity(this._reverse);
        return afterProcessIsValid;
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
        return new IteratorServer(this);
    }
    getReverseIterator() {
        return new IteratorServer(this, true);
    }
    addItem(item) {
        this._items.push(item);
    }
    getItems() {
        return this._items;
    }
    getItem(itemIdetifier) {
        return this._items.find(({ pathServer }) => pathServer == itemIdetifier);
    }
    getExtremity(reverse) {
        return (reverse) ? 0 : this._items.length - 1;
    }
}
