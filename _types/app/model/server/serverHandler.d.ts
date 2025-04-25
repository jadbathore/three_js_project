import { type AppRouter } from "../../route/routeur.js";
import { type Express } from "express";
export declare class ServerHandler {
    private static _socketHandlerInterface;
    private static _iteratorAggregate;
    private _proxy;
    private readonly _target;
    private _subject;
    constructor(data: AppRouter[], socketHandlerInterface: Server.SocketHandler<AppRouter>, subject: LibFile.Subject);
    private serverProxyHandler;
    private static accessAppRouter;
    private static handleSocketType;
    private createRoute;
    private serverWatcher;
    runServer(app: Express): void;
}
