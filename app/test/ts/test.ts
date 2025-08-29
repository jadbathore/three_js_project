import { RequestParser, ResponseParser } from "../../model/server/headParser.js";
import { TCPServerSingleTone } from "../../server/client.js";
import net from 'net'


const instance = TCPServerSingleTone.getInstance(3000 as Server.Port)

instance.setData((parser:Server.ResponseData,client:net.Socket)=>{
    switch (parser.code){
        case 101 :
            console.log(parser.message)
            console.log(parser.code)
            const requestArgs:Server.RequestArguments = {
                path:'/',
                host:'localhost',
                method:'GET',
                protocole:parser.protocole,
                headers: {
                    Cookies:'test=1234;'
                }
            }
            const requestParse = new RequestParser(requestArgs)
            client.write(requestParse.request)
        break;
        case 300:

        break;

    }   
})

