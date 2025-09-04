import chalk from "chalk";
import { DataParser, RequestParser, ResponseParser } from "../model/server/headParser.js";
import { SocketTLS, TCPServerSingleTone } from "../model/server/client.js";
import net from 'net'
import type { webSocketServer } from "../model/server/client.js";
import internal from "stream";
import { responseHandler } from "../model/server/headHandler.js";



const instance = TCPServerSingleTone.getInstance(3000 as Server.Port,8080 as Server.Port);
// const instance = SocketTLS.instance
function dataCallBack(dataParse:Server.ResponseData|Server.RequestData,client:net.Socket,webSocket:webSocketServer):void
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

instance.setData(dataCallBack)

instance.setEnd(()=>{
    console.log(chalk.bgYellow('Serveur TCP Ended'))
    process.exit(1)
})

