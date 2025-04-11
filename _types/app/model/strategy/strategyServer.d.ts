import { type Express } from "express";
import { type AppRouter } from "../../route/routeur.js";
export declare class Context {
    private _strategy;
    private _subject;
    private _serverEvent;
    private readonly _proxyHandler;
    private _proxy;
    constructor(strategy: Server.Strategy);
    setStrategy(strategy: Server.Strategy): void;
    runServer(): void;
    private setServerEventProxy;
    private setProxy;
    serverWatcher(app: Express): void;
}
export declare class ServerStrategy implements Server.Strategy {
    private _data;
    private _compilerArray;
    constructor(data: AppRouter[]);
    doAlgorithm(app: Express, subject: LibFile.Subject, test: Array<string>): void;
}
