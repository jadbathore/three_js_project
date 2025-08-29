class PlainData {
    constructor(data = null) {
        [this._PlainHeader, this._PlainBody] = data?.split('\r\n\r\n') ?? [null, null];
    }
    HeaderInfo() {
        const [requestInfo, ...headers] = this._PlainHeader.split('\r\n');
        return [requestInfo, headers];
    }
}
export class ResponseParser extends PlainData {
    constructor(data) {
        super(data);
        const [protocole, code, argsMessage, headersObj] = this.setHeaders(...this.HeaderInfo());
        this._protocole = protocole;
        this._code = this.setCode(code);
        this._message = argsMessage.join(' ');
        this._headers = headersObj;
        this._body = this._PlainBody;
    }
    isCodeServer(value) {
        return Number.isInteger(value) && value >= 100 && value <= 599;
    }
    setCode(code) {
        const codeTest = +code;
        if (this.isCodeServer(codeTest)) {
            return codeTest;
        }
        else {
            throw new Error(`unknow code server: ${code}`);
        }
    }
    setHeaders(requestInfo, headers) {
        const [protocole, code, ...args] = requestInfo.split(' ');
        const headersObj = {};
        headers.forEach((element) => {
            const [keyheader, ...value] = element.replace(' ', '').split(':');
            headersObj[keyheader] = value.join(':');
        });
        return [protocole, code, args, headersObj];
    }
    get headers() {
        return this._headers;
    }
    get code() {
        return this._code;
    }
    get message() {
        return this._message;
    }
    get protocole() {
        return this._protocole;
    }
    get body() {
        return this._body;
    }
}
export class RequestParser extends PlainData {
    constructor({ protocole: protocole, method: method, host: host, path: path, headers: headers, }) {
        super();
        this._protocole = protocole;
        this._headers = headers;
        this._method = method;
        this._host = host;
        this._path = path;
    }
    get request() {
        let headers = [this._method, this._path, this._protocole].join(' ') + "\r\n";
        headers += `host: ${this._host} \r\n`;
        Object.entries(this._headers).forEach(([key, value]) => {
            headers += `${key}:${value}\r\n`;
        });
        headers += '\r\n';
        return headers;
    }
}
