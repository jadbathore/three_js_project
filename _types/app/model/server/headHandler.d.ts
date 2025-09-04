import net from 'net';
import internal from "stream";
export declare function responseHandler(response: Server.ResponseData, client: net.Socket): void;
export declare function responseHandler(response: Server.ResponseData, client: internal.Duplex): void;
