export declare class proxyObserver implements LibFile.ProxyDirObserver {
    private _observer;
    private _proxy;
    constructor(observer: LibFile.Observer);
    ProxyBehavior(callBack: (event: EventFile, path: String) => void): void;
    proxyRevoke(): void;
}
