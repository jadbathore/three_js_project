import { AppRouter } from "../../route/routeur.js";
import { SocketTree } from "../../model/server/client.js";
export declare class SocketImplement implements Server.SocketHandler<AppRouter> {
    private static instanceServer;
    constructor(socket: SocketTree);
    handleConnection({ CompilerTuple: [compiler, oberserver, proxy] }: AppRouter): void;
    handleReconnection({ CompilerTuple: [compiler, oberserver] }: AppRouter): void;
    handleDeconnection({ CompilerTuple: [compiler, oberserver, proxy] }: AppRouter): void;
}
