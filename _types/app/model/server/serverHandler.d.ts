import { type AppRouter } from "../../route/routeur.js";
import { type Express } from "express";
export declare enum responseAction {
    redirection = "redirect"
}
export declare class ServerHandler {
    private static _socketHandlerInterface;
    private static _iteratorAggregate;
    private _serverConnection;
    private _server;
    private _app;
    private _proxy;
    private _redisClient?;
    private _port;
    private readonly _target;
    private _subject;
    constructor(data: AppRouter[], socketHandlerInterface: Server.SocketHandler<AppRouter, Express.Request>, subject: LibFile.Subject, app: Express, port: number);
    private setRedisclient;
    private static isExpressRequest;
    private fourdigitPort;
    private serverProxyHandler;
    private static accessAppRouter;
    private static handleSocketType;
    private createRoute;
    private serverWatcher;
    private restartProxy;
    private initWatcher;
    private setFile;
    private getFile;
    private tryPort;
    private setApp;
    private websocket;
    private setServer;
    runServer(app: Express): void;
    upgradeServeur(): void;
    run(): void;
    restartServer(): void;
    shutDown(path: string): void;
}
