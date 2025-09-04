import chalk from "chalk";

abstract class PlainData {
    protected readonly _PlainHeader:string;
    protected _PlainBody:string;  
    protected _protocole:string;
    protected _headers:Server.Headers;

    protected constructor(data:string = null){
        [this._PlainHeader,this._PlainBody] = data?.split('\r\n\r\n') ?? [null,null];
    }

    protected static HeaderInfo(data:string):[string,string[]]  {
        const [requestInfo,...headers]:string[] = data.split('\r\n');
        return [requestInfo,headers]
    }

    protected objectifyHeaders(headers:string[]){
        const headersObj:Server.Headers = {}
        headers.forEach((element)=>{
            const [keyheader,...value] = element.replace(' ','').split(':');
            headersObj[keyheader] = value.join(':');
        })
        return headersObj;
    }

    protected static isCodeServer(value:string):boolean
    protected static isCodeServer(value:number):value is Server.CodeServer 
    protected static isCodeServer(value:number|string):value is Server.CodeServer 
    {
        const codeTest:number = +value;
        return Number.isInteger(codeTest) && codeTest >= 100 && codeTest <= 599
    }

    protected static isPath(value:string):value is Server.Path 
    {
        return /\//g.test(value)
    }

    public static tryCode(value:string): Server.CodeServer
    public static tryCode(code:number):Server.CodeServer
    public static tryCode(value:string|number): Server.CodeServer
    {
        const codeTest:number = +value;
        if(PlainData.isCodeServer(codeTest)) {
            return codeTest
        } else {
            throw new Error(value + "is not a codeStatus")
        }
    }

    public static tryPath(value:string):Server.Path
    {
        if(PlainData.isPath(value)) {
            return value 
        } else {
            throw new Error(value + "is not a path server")
        }
    }


    public get headers():Server.Headers
    {
        return this._headers;
    }

    public get protocole():string
    {
        return this._protocole;
    }

    public get body():string
    {
        return this._PlainBody;
    }
}

export class DataParser extends PlainData {

    public static responseOrRequest(data:string):Server.ResponseData|Server.RequestData {
        const dataprotocole:string = PlainData.HeaderInfo(data)[0];
        const [first,second,...third]:string[] = dataprotocole.split(' ');
        switch (true){
            case DataParser.isResponse(first,second,third):
                return new ResponseParser(data);
            case DataParser.isRequest(first,second,third.join(' ')):
                return new RequestParser(data);
            default : 
                throw new Error('data is neither a response or a request')
        }
    }

    private static isResponse(first:string,second:string,third:unknown):boolean
    {
        return (typeof first == "string") && (this.isCodeServer(second)) && (Array.isArray(third))
    }

    private static isRequest(first:string,second:string,third:string):boolean
    {
        return (typeof first == "string") && (this.isPath(second)) && (typeof first == "string")
    }

    public static isRequestData(value: Server.RequestData|Server.ResponseData): value is Server.RequestData
    {
        return 'path' in value && 
        'host' in value && 
        'methods' in value && 
        'request'in value;
    }
}

abstract class ParseData extends PlainData {
    protected abstract setHeaders(requestInfo:string,headers:string[]):[string,string,string[]|string,Server.Headers];

    protected setHeaderObject(headers:Server.Headers):string
    {
        const arrayHeaders = Object.entries(headers);
        let stringHeader = "";
        if(arrayHeaders.length >= 1){
            Object.entries(this._headers).forEach(([key,value])=> {
                stringHeader += `${key}:${value}\r\n`
            })
        }
        // console.log(stringHeader)
        return stringHeader
    }
}

export class ResponseParser extends ParseData implements Server.ResponseData {
    
    private readonly _message:string;
    protected readonly _code:Server.CodeServer;
    

    public constructor(data:Server.ResponseArguments)
    public constructor(data:string)
    public constructor(data:string|Server.ResponseArguments)
    {
        if(typeof data != "string"){
            super()
            const {
                protocole:protocole,
                code:code,
                message:message,
                headers:headers,
                body:body
            } = data;
            this._protocole = protocole;
            this._code = code;
            this._message = message;
            this._headers = headers ?? {};
            this._PlainBody = body ?? ''
        } else {
            super(data)
            const [protocole,code,argsMessage,headersObj]:[string,string,string[],Server.Headers] = this.setHeaders(...ResponseParser.HeaderInfo(data));
            this._protocole = protocole;
            this._code = ResponseParser.tryCode(code);
            this._message = argsMessage.join(' ');
            this._headers = headersObj ?? {}
        }
        
    }
    
    protected setHeaders(requestInfo:string,headers:string[]):[string,string,string[],Server.Headers]
    {
        const [protocole,code,...args]:string[] = requestInfo.split(' ');
        return [protocole,code,args,this.objectifyHeaders(headers)];
    }

    public get response():string
    {
        return [
            [this._protocole,this._code,this._message].join(' '),
            this.setHeaderObject(this._headers),
            '',
            this._PlainBody ?? ''
        ].join("\r\n")
    }

    public get code():Server.CodeServer
    {
        return this._code;
    }

    public get message():string
    {
        return this._message;
    }

}

export class RequestParser extends ParseData {

    private readonly _host:string;
    private readonly _method:string;
    private readonly _path:Server.Path;


    public constructor(data:Server.RequestArguments)
    public constructor(data:string)
    public constructor(data:string|Server.RequestArguments)
    {
        if(typeof data != "string"){
            const {
                protocole:protocole,
                method:method,
                host:host,
                path:path,
                headers:headers,
                body:body
            } = data;
            super()
            this._protocole = protocole;
            this._headers = headers ?? {};
            this._method = method;
            this._host = host;
            this._path = RequestParser.tryPath(path);
            this._PlainBody = body ?? ''
        } else {
            super(data);
            const [methods,path,protocole,headersObj]:[string,string,string,Server.Headers] = this.setHeaders(...RequestParser.HeaderInfo(data));
            this._method = methods;
            this._path = RequestParser.tryPath(path);
            this._protocole = protocole;
            this._headers = headersObj ?? {};
            this._host = headersObj?.host ?? '';
        }
        
    }

    protected setHeaders(requestInfo:string,headers:string[]):[string,string,string,Server.Headers]
    {
        const [methods,path,protocole]:string[] = requestInfo.split(' ');
        return [methods,path,protocole,this.objectifyHeaders(headers)];
    }

    public get request():string
    {
        return [
            [this._method,this._path,this._protocole].join(' '),
            `host:${this._host}`,
            this.setHeaderObject(this._headers),
            '',
            this._PlainBody,
        ].join("\r\n")
        // console.log([this._method,this._path,this._protocole].join(' '))
        // let headers:string = [this._method,this._path,this._protocole].join(' ') + "\r\n";
        // headers += `host: ${this._host} \r\n`
        // headers += this.setHeaderObject(this._headers);
        // headers += '\r\n'
        // headers += this._PlainBody
        // return headers
    }

    public get methods():string
    {
        return this._method;
    }

    public get path():Server.Path
    {
        return this._path;
    }

    public get host():string
    {
        return this._host;
    }
}


