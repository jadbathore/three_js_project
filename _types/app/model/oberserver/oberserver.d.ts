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
    private readonly _firstLayerProxyHandler;
    private readonly _secondLayerProxyHandler;
    constructor(path: string);
    update(subject: LibFile.Subject, event: EventFile): AsyncGenerator<any, any, EventPromise>;
    private setFirstLayerProxyHandler;
    private setSecondLayerProxy;
    addEvent(event: EventFile): void;
    get events(): EventFile[];
    get path(): string;
    get firstLayerproxyHandler(): ProxyHandler<EventFile[]>;
    get secondLayerproxyHandler(): ProxyHandler<EventProxy>;
}
export declare function proxyObserver(observer: LibFile.Observer, callBack?: (event: EventFile, path: String, selfProxy: EventFile[]) => void): EventFile[];
export declare function proxyRevokeCall(proxy: EventFile[], observer: LibFile.Observer): {
    proxy: EventProxy;
    revoke: () => void;
};
