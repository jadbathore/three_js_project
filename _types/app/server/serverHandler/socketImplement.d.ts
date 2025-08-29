import { AppRouter } from "../../route/routeur.js";
export declare class Socket implements Server.SocketHandler<AppRouter, Express.Request> {
    handleConnection({ CompilerTuple: [compiler, oberserver, proxy] }: AppRouter, request: Express.Request): void;
    handleReconnection({ CompilerTuple: [compiler, oberserver] }: AppRouter): void;
    handleDeconnection({ CompilerTuple: [compiler, oberserver, proxy] }: AppRouter): void;
}
