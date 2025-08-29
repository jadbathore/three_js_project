declare abstract class PlainData {
    protected readonly _PlainHeader: string;
    protected readonly _PlainBody: string;
    protected _protocole: string;
    protected _headers: Server.Headers;
    protected constructor(data?: string);
    protected HeaderInfo(): [string, string[]];
}
export declare class ResponseParser extends PlainData implements Server.ResponseData {
    private readonly _message;
    private readonly _body;
    protected readonly _code: Server.CodeServer;
    constructor(data: string);
    private isCodeServer;
    protected setCode(code: string): Server.CodeServer;
    protected setCode(code: number): Server.CodeServer;
    private setHeaders;
    get headers(): Server.Headers;
    get code(): Server.CodeServer;
    get message(): string;
    get protocole(): string;
    get body(): string;
}
export declare class RequestParser extends PlainData {
    private readonly _host;
    private readonly _method;
    private readonly _path;
    constructor({ protocole: protocole, method: method, host: host, path: path, headers: headers, }: Server.RequestArguments);
    get request(): string;
}
export {};
