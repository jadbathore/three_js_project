export declare class CompilerWatchSubject implements LibFile.Subject {
    observers: LibFile.Observer[];
    attach(observer: LibFile.Observer): void;
    detach(observer: LibFile.Observer): void;
    notify(event: EventFile): Promise<void>;
    addEventObserver(observer: LibFile.Observer, eventPromise: EventPromise): Awaited<void>;
}
export declare class ObserverWatch implements LibFile.Observer {
    private _events;
    private readonly _path;
    constructor(path: string);
    update(subject: LibFile.Subject, event: EventFile): AsyncGenerator<any, any, EventPromise>;
    addEvent(event: EventFile): void;
    get events(): EventFile[];
    get path(): string;
}
export declare function ProxyObserver(observer: LibFile.Observer, callBack: (event: EventFile, path: String) => void): void;
