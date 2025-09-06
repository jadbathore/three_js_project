import chalk from "chalk";
import { DataParser } from "../model/server/headParser.js";
import { TLSClientSingleTone, TCPServerSingleTone } from "../model/server/client.js";
import net from 'net'
import type { webSocketServer,WebHolder, WebSocketHolderSocketImplementTupleData ,WebSocketHolderSocketImplementTuple,CallBackWebSocketHolderData,CallBackWebSocketHolder} from "../model/server/client.js";
import { responseHandler } from "../model/server/headHandler.js";
import PathUtility from "../model/CompilerSetUp/Utility/pathUtility.js";
import { TLSSocket } from "tls";

function dataCallBack<T extends WebHolder>(dataParse:Server.ResponseData|Server.RequestData,client:T,webSocket:webSocketServer):void
{
    if(!DataParser.isRequestData(dataParse)) {
        /*------handle-response------*/ 
        responseHandler(dataParse,client)
    } else {
        /*------handle-request-------*/ 
        webSocket.clients.forEach((client)=>{
            const event:Server.webSocketEvent = {
                event:dataParse.methods,
                payload:dataParse.body
            }
            client.send(JSON.stringify(event))
        })
    }
}

function endCallBack<T extends WebHolder>(client:T,webSocket:webSocketServer){ 
    const protocole:string = (client instanceof TLSSocket)?'TLS':'TCP';
    console.log(chalk.bgYellow(`Serveur ${protocole} Ended`))
    process.exit(1)
}

function errorCallback(error:Error){
    console.log(error.message)
}

function setCallBacks<T extends WebHolder>(interfaceClient:Server.Socket<WebSocketHolderSocketImplementTupleData<T>,WebSocketHolderSocketImplementTuple<T>>)
{
    interfaceClient.setData(dataCallBack as CallBackWebSocketHolderData<T>)
    interfaceClient.setEnd(endCallBack as CallBackWebSocketHolder<T>)
    interfaceClient.setError(errorCallback)
}

let clientInstance:TCPServerSingleTone|TLSClientSingleTone;
const key = PathUtility.getKeyBuffer()
const perm = PathUtility.getCertBuffer()
if(key && perm){
    clientInstance = TLSClientSingleTone.getInstance(3000 as Server.Port,'localhost',8080 as Server.Port);
    setCallBacks<TLSSocket>(clientInstance)
} else {
    clientInstance =  TCPServerSingleTone.getInstance(3000 as Server.Port,8080 as Server.Port);
    setCallBacks<net.Socket>(clientInstance)
}
