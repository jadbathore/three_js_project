import { AppRouter } from "../../route/routeur.js";
export declare class Socket implements Server.SocketHandler<AppRouter> {
    handleConnection({ CompilerTuple: [compiler, oberserver, proxy] }: AppRouter): void;
    handleFirstConnection({ CompilerTuple: [compiler, oberserver] }: AppRouter): void;
    handleDeconnection({ CompilerTuple: [compiler, oberserver, proxy] }: AppRouter): void;
}
