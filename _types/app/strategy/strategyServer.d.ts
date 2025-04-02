import type { Express } from "express";
import type { route } from "../route/routeur.js";
import { CompilerWatchSubject } from '../oberserver/oberserver';
export declare class Context {
    private _strategy;
    private _subject;
    constructor(strategy: Server.Strategy);
    setStrategy(strategy: Server.Strategy): void;
    runServer(): void;
}
export declare class ServerStrategy implements Server.Strategy {
    private _data;
    constructor(data: route[]);
    doAlgorithm(app: Express, subject: CompilerWatchSubject): void;
}
