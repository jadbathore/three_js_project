import net from 'net';
export declare class TCPServerSingleTone {
    private static _instance;
    private _instanceClient;
    private readonly _port;
    private constructor();
    private get instanceClient();
    static getInstance(port: Server.Port): TCPServerSingleTone;
    private createConnection;
    setData(callBack: (parser: Server.ResponseData, instanceClient: net.Socket) => void): void;
    private end;
}
