import type { AppRouter } from "../../route/routeur.js";
export declare class IteratorServer implements Server.Iterator<AppRouter> {
    private _collection;
    private _index;
    private _reverse;
    constructor(collection: Server.Aggregator<AppRouter>, reverse?: boolean);
    rewind(): void;
    current(): AppRouter;
    next(): AppRouter;
    valid(): boolean;
}
export declare class ServerRouteAggregate implements Server.Aggregator<AppRouter> {
    private _items;
    constructor(routes: AppRouter[]);
    getCount(): number;
    getIterator(): Server.Iterator<AppRouter>;
    getReverseIterator(): Server.Iterator<AppRouter>;
    addItem(item: AppRouter): void;
    getItems(): AppRouter[];
    getExtremity(reverse: boolean): number;
}
