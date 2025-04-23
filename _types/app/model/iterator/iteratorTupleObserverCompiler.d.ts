import { Compiler } from "../CompilerSetUp/Compiler";
type complierObserverTuple = [Compiler, LibFile.Observer];
export declare class iteratorTupleObserverCompiler implements Server.Iterator<complierObserverTuple> {
    private _collection;
    private _index;
    private _reverse;
    constructor(collection: Server.Aggregator<complierObserverTuple>, reverse?: boolean);
    rewind(): void;
    current(): complierObserverTuple;
    next(): complierObserverTuple;
    valid(): boolean;
}
export declare class ServerRouteAggregate implements Server.Aggregator<complierObserverTuple> {
    private _items;
    constructor(routes: complierObserverTuple[]);
    getCount(): number;
    getIterator(): Server.Iterator<complierObserverTuple>;
    getReverseIterator(): Server.Iterator<complierObserverTuple>;
    addItem(item: complierObserverTuple): void;
    getItems(): complierObserverTuple[];
    getExtremity(reverse: boolean): number;
}
export {};
