abstract class PlainData {
    protected readonly _PlainHeader:string;
    protected readonly _PlainBody:string;  
    protected _protocole:string;
    protected _headers:Server.Headers;


    protected constructor(data:string = null){
        [this._PlainHeader,this._PlainBody] = data?.split('\r\n\r\n') ?? [null,null];
    }

    protected HeaderInfo():[string,string[]]  {
        const [requestInfo,...headers]:string[] = this._PlainHeader.split('\r\n');
        return [requestInfo,headers]
    }
    
}

export class ResponseParser extends PlainData implements Server.ResponseData {
    
    private readonly _message:string;
    private readonly _body:string;
    protected readonly _code:Server.CodeServer;
    
    public constructor(data:string){
        super(data)
        const [protocole,code,argsMessage,headersObj]:[string,string,string[],Server.Headers] = this.setHeaders(...this.HeaderInfo());
        this._protocole = protocole;
        this._code = this.setCode(code);
        this._message = argsMessage.join(' ');
        this._headers = headersObj
        this._body = this._PlainBody;
    }

    private isCodeServer(value:number):value is Server.CodeServer {
        return Number.isInteger(value) && value >= 100 && value <= 599
    }
    
    protected setCode(code:string):Server.CodeServer
    protected setCode(code:number):Server.CodeServer
    protected setCode(code:string|number):Server.CodeServer {
        const codeTest:number = +code;
        if(this.isCodeServer(codeTest)){
            return codeTest
        } else {
            throw new Error(`unknow code server: ${code}`)
        }
    }

    private setHeaders(requestInfo:string,headers:string[]):[string,string,string[],Server.Headers]{
        const [protocole,code,...args]:string[] = requestInfo.split(' ');
        const headersObj:Server.Headers = {}
        headers.forEach((element)=>{
            const [keyheader,...value] = element.replace(' ','').split(':');
            headersObj[keyheader] = value.join(':');
        })
        return [protocole,code,args,headersObj]

    }

    public get headers():Server.Headers
    {
        return this._headers;
    }

    public get code():Server.CodeServer
    {
        return this._code;
    }

    public get message():string
    {
        return this._message;
    }

    public get protocole():string
    {
        return this._protocole;
    }

    public get body():string
    {
        return this._body;
    }
}




export class RequestParser extends PlainData {

    private readonly _host:string;
    private readonly _method:string;
    private readonly _path:string;

    public constructor({
            protocole:protocole,
            method:method,
            host:host,
            path:path,
            headers:headers,
        }:Server.RequestArguments
        ){
        super()
        this._protocole = protocole;
        this._headers = headers;
        this._method = method;
        this._host = host;
        this._path = path
    }

    public get request()
    {
        let headers:string = [this._method,this._path,this._protocole].join(' ') + "\r\n";
        headers += `host: ${this._host} \r\n`
        Object.entries(this._headers).forEach(([key,value])=>{
            headers += `${key}:${value}\r\n`
        })
        headers += '\r\n'
        return headers
    }
}