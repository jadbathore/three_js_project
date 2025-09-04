class PlainData {
    constructor(data = null) {
        [this._PlainHeader, this._PlainBody] = data?.split('\r\n\r\n') ?? [null, null];
    }
    static HeaderInfo(data) {
        const [requestInfo, ...headers] = data.split('\r\n');
        return [requestInfo, headers];
    }
    objectifyHeaders(headers) {
        const headersObj = {};
        headers.forEach((element) => {
            const [keyheader, ...value] = element.replace(' ', '').split(':');
            headersObj[keyheader] = value.join(':');
        });
        return headersObj;
    }
    static isCodeServer(value) {
        const codeTest = +value;
        return Number.isInteger(codeTest) && codeTest >= 100 && codeTest <= 599;
    }
    static isPath(value) {
        return /\//g.test(value);
    }
    static tryCode(value) {
        const codeTest = +value;
        if (PlainData.isCodeServer(codeTest)) {
            return codeTest;
        }
        else {
            throw new Error(value + "is not a codeStatus");
        }
    }
    static tryPath(value) {
        if (PlainData.isPath(value)) {
            return value;
        }
        else {
            throw new Error(value + "is not a path server");
        }
    }
    get headers() {
        return this._headers;
    }
    get protocole() {
        return this._protocole;
    }
    get body() {
        return this._PlainBody;
    }
}
export class DataParser extends PlainData {
    static responseOrRequest(data) {
        const dataprotocole = PlainData.HeaderInfo(data)[0];
        const [first, second, ...third] = dataprotocole.split(' ');
        switch (true) {
            case DataParser.isResponse(first, second, third):
                return new ResponseParser(data);
            case DataParser.isRequest(first, second, third.join(' ')):
                return new RequestParser(data);
            default:
                throw new Error('data is neither a response or a request');
        }
    }
    static isResponse(first, second, third) {
        return (typeof first == "string") && (this.isCodeServer(second)) && (Array.isArray(third));
    }
    static isRequest(first, second, third) {
        return (typeof first == "string") && (this.isPath(second)) && (typeof first == "string");
    }
    static isRequestData(value) {
        return 'path' in value &&
            'host' in value &&
            'methods' in value &&
            'request' in value;
    }
}
class ParseData extends PlainData {
    setHeaderObject(headers) {
        const arrayHeaders = Object.entries(headers);
        let stringHeader = "";
        if (arrayHeaders.length >= 1) {
            Object.entries(this._headers).forEach(([key, value]) => {
                stringHeader += `${key}:${value}\r\n`;
            });
        }
        return stringHeader;
    }
}
export class ResponseParser extends ParseData {
    constructor(data) {
        if (typeof data != "string") {
            super();
            const { protocole: protocole, code: code, message: message, headers: headers, body: body } = data;
            this._protocole = protocole;
            this._code = code;
            this._message = message;
            this._headers = headers ?? {};
            this._PlainBody = body ?? '';
        }
        else {
            super(data);
            const [protocole, code, argsMessage, headersObj] = this.setHeaders(...ResponseParser.HeaderInfo(data));
            this._protocole = protocole;
            this._code = ResponseParser.tryCode(code);
            this._message = argsMessage.join(' ');
            this._headers = headersObj ?? {};
        }
    }
    setHeaders(requestInfo, headers) {
        const [protocole, code, ...args] = requestInfo.split(' ');
        return [protocole, code, args, this.objectifyHeaders(headers)];
    }
    get response() {
        return [
            [this._protocole, this._code, this._message].join(' '),
            this.setHeaderObject(this._headers),
            '',
            this._PlainBody ?? ''
        ].join("\r\n");
    }
    get code() {
        return this._code;
    }
    get message() {
        return this._message;
    }
}
export class RequestParser extends ParseData {
    constructor(data) {
        if (typeof data != "string") {
            const { protocole: protocole, method: method, host: host, path: path, headers: headers, body: body } = data;
            super();
            this._protocole = protocole;
            this._headers = headers ?? {};
            this._method = method;
            this._host = host;
            this._path = RequestParser.tryPath(path);
            this._PlainBody = body ?? '';
        }
        else {
            super(data);
            const [methods, path, protocole, headersObj] = this.setHeaders(...RequestParser.HeaderInfo(data));
            this._method = methods;
            this._path = RequestParser.tryPath(path);
            this._protocole = protocole;
            this._headers = headersObj ?? {};
            this._host = headersObj?.host ?? '';
        }
    }
    setHeaders(requestInfo, headers) {
        const [methods, path, protocole] = requestInfo.split(' ');
        return [methods, path, protocole, this.objectifyHeaders(headers)];
    }
    get request() {
        return [
            [this._method, this._path, this._protocole].join(' '),
            `host:${this._host}`,
            this.setHeaderObject(this._headers),
            '',
            this._PlainBody,
        ].join("\r\n");
    }
    get methods() {
        return this._method;
    }
    get path() {
        return this._path;
    }
    get host() {
        return this._host;
    }
}
