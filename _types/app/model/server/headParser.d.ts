declare abstract class PlainData {
    protected readonly _PlainHeader: string;
    protected _PlainBody: string;
    protected _protocole: string;
    protected _headers: Server.Headers;
    protected constructor(data?: string);
    protected static HeaderInfo(data: string): [string, string[]];
    protected objectifyHeaders(headers: string[]): Server.Headers;
    protected static isCodeServer(value: string): boolean;
    protected static isCodeServer(value: number): value is Server.CodeServer;
    protected static isPath(value: string): value is Server.Path;
    static tryCode(value: string): Server.CodeServer;
    static tryCode(code: number): Server.CodeServer;
    static tryPath(value: string): Server.Path;
    get headers(): Server.Headers;
    get protocole(): string;
    get body(): string;
}
export declare class DataParser extends PlainData {
    static responseOrRequest(data: string): Server.ResponseData | Server.RequestData;
    private static isResponse;
    private static isRequest;
    static isRequestData(value: Server.RequestData | Server.ResponseData): value is Server.RequestData;
}
declare abstract class ParseData extends PlainData {
    protected abstract setHeaders(requestInfo: string, headers: string[]): [string, string, string[] | string, Server.Headers];
    protected setHeaderObject(headers: Server.Headers): string;
}
export declare class ResponseParser extends ParseData implements Server.ResponseData {
    private readonly _message;
    protected readonly _code: Server.CodeServer;
    constructor(data: Server.ResponseArguments);
    constructor(data: string);
    protected setHeaders(requestInfo: string, headers: string[]): [string, string, string[], Server.Headers];
    get response(): string;
    get code(): Server.CodeServer;
    get message(): string;
}
export declare class RequestParser extends ParseData {
    private readonly _host;
    private readonly _method;
    private readonly _path;
    constructor(data: Server.RequestArguments);
    constructor(data: string);
    protected setHeaders(requestInfo: string, headers: string[]): [string, string, string, Server.Headers];
    get request(): string;
    get methods(): string;
    get path(): Server.Path;
    get host(): string;
}
export {};
