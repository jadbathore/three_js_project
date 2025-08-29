import net from 'net'
import http from 'http'
import{ RequestParser, ResponseParser } from '../../app/model/server/headParser.js'
import chalk from 'chalk';
// import { Utils } from 'utils/Utils'

const _array:string[] = []

function oneCall(target:any, propertyKey:string,descriptor:PropertyDescriptor){
    const orginalMethod = descriptor.value;
    descriptor.value = function (...args:any[]){
        if (!_array.includes(propertyKey)){
            _array.push(propertyKey)
            return orginalMethod.apply(this,args)
        }
    }
}


export class TCPServerSingleTone {
    private static _instance:TCPServerSingleTone;
    private _instanceClient:net.Socket;
    private readonly _port:Server.Port;

    private constructor (port:Server.Port){
        this._port = port
        this.end()
    }

    private get instanceClient():net.Socket {
        if(!this._instanceClient){
            this._instanceClient = this.createConnection(this._port);
        }
        return this._instanceClient
    }

    public static getInstance(port:Server.Port): TCPServerSingleTone {
        if (!TCPServerSingleTone._instance) {
            TCPServerSingleTone._instance = new TCPServerSingleTone(port);
        }
        return TCPServerSingleTone._instance;
    } 

    private createConnection(port:Server.Port):net.Socket
    {
        const client = net.createConnection({port:port},()=>{
        const requestHeader:Server.RequestArguments = {
                method:'GET',
                path:'/',
                protocole:'HTTP/1.1',
                host:'localhost',
                headers:{
                    'Connection':'Upgrade',
                    'Upgrade':'tree-for-three',
                    'key-tree':'1234',
                }
            }
            const requestParse = new RequestParser(requestHeader)
            client.write(requestParse.request)
        })
        return client;
    }



    @oneCall
    public setData(callBack:(parser:Server.ResponseData,instanceClient:net.Socket)=>void):void{
        this.instanceClient.on('data',(data:Buffer<ArrayBufferLike>)=>{
            const parser = new ResponseParser(data.toString())
            callBack(parser,this._instanceClient)
        })
    }

    @oneCall
    private end(){
        this.instanceClient.on('end', () => {
            console.log(chalk.yellow('Server TCP end'));
        });
    }

}

