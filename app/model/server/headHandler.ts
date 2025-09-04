import chalk from "chalk";
import { DataParser, RequestParser, ResponseParser } from "../../model/server/headParser.js";
import { TCPServerSingleTone } from "./client.js";
import net from 'net'
import internal from "stream";

export function responseHandler(response:Server.ResponseData,client:net.Socket):void
export function responseHandler(response:Server.ResponseData,client:internal.Duplex):void
export function responseHandler(response:Server.ResponseData,client:net.Socket|internal.Duplex):void
{
    const cases:Server.handlerCode = {};
    cases["200"] = () => { console.log(chalk.green(`${response.protocole}: ${response.message} (${response.code})`)) };
    cases["303"] = cases["200"];
    cases["400"] = () =>{ console.log(chalk.red(`${response.protocole}: ${response.message} (${response.code})`)) };

    if(client instanceof net.Socket) 
        {
        cases["101"] = () => {
            const toCompileFile = (response.headers['to-compile'] == '')? '/' : response.headers['to-compile']
                const requestArgs:Server.RequestArguments = {
                    path:DataParser.tryPath(toCompileFile),
                    host:'localhost',              
                    method:'GET',
                    protocole:TCPServerSingleTone.UpgratedProtocole,
                    headers: {
                        Cookies:'test=1234;'
                    }
                };
                const requestParse = new RequestParser(requestArgs);
                client.write(requestParse.request);
        }
    }
    cases[response.code]?.() 
}