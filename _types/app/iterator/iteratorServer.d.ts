import type { route } from "../route/routeur.js";
export declare class IteratorServer implements Server.Iterator<route> {
    private _collection;
    private _index;
    private _reverse;
    constructor(collection: Server.Aggregator<route>, reverse?: boolean);
    rewind(): void;
    current(): route;
    next(): route;
    valid(): boolean;
}
export declare class ServerRouteAggregate implements Server.Aggregator<route> {
    private _items;
    constructor(routes: route[]);
    getCount(): number;
    getIterator(): Server.Iterator<route>;
    getReverseIterator(): Server.Iterator<route>;
    addItem(item: route): void;
    getItems(): route[];
    getExtremity(reverse: boolean): number;
}
