import type { Express } from "express";
import type { AppRouter } from "../route/routeur.js";
export declare class Context {
    private _strategy;
    private _subject;
    constructor(strategy: Server.Strategy);
    setStrategy(strategy: Server.Strategy): void;
    runServer(): void;
}
export declare class ServerStrategy implements Server.Strategy {
    private _data;
    constructor(data: AppRouter[]);
    doAlgorithm(app: Express): void;
}
