import chalk from "chalk";
import { DataParser, RequestParser, ResponseParser } from "../../model/server/headParser.js";
import { TCPServerSingleTone } from "../../model/server/client.js";
const instance = TCPServerSingleTone.getInstance(3000, 8080);
function dataCallBack(dataParse, client, webSocket) {
    if (!DataParser.isRequestData(dataParse)) {
        switch (dataParse.code) {
            case 101:
                {
                    const toCompileFile = (dataParse.headers['to-compile'] == '') ? '/' : dataParse.headers['to-compile'];
                    const requestArgs = {
                        path: DataParser.tryPath(toCompileFile),
                        host: 'localhost',
                        method: 'GET',
                        protocole: TCPServerSingleTone.UpgratedProtocole,
                        headers: {
                            Cookies: 'test=1234;'
                        }
                    };
                    const requestParse = new RequestParser(requestArgs);
                    client.write(requestParse.request);
                }
                break;
            case 200:
            case 303:
                {
                    console.log(chalk.green(`${dataParse.protocole}: ${dataParse.message} (${dataParse.code})`));
                }
                ;
                break;
            case 400:
                {
                    console.log(chalk.red(`${dataParse.protocole}: ${dataParse.message} (${dataParse.code})`));
                }
                ;
                break;
            default:
                {
                    const responseArgs = {
                        protocole: 'HTTP/1.1',
                        code: ResponseParser.tryCode(400),
                        message: 'unknown',
                        body: 'unknow code data form'
                    };
                    const responseParser = new ResponseParser(responseArgs);
                    client.write(responseParser.response);
                }
        }
    }
    else {
        webSocket.clients.forEach((client) => {
            const event = {
                event: dataParse.methods,
                payload: dataParse.body
            };
            client.send(JSON.stringify(event));
        });
    }
}
instance.setData(dataCallBack);
instance.setEnd(() => {
    console.log(chalk.bgYellow('Serveur TCP Ended'));
    process.exit(1);
});
