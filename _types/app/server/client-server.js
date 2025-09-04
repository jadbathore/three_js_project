import chalk from "chalk";
import { DataParser } from "../model/server/headParser.js";
import { TCPServerSingleTone } from "../model/server/client.js";
import { responseHandler } from "../model/server/headHandler.js";
const instance = TCPServerSingleTone.getInstance(3000, 8080);
function dataCallBack(dataParse, client, webSocket) {
    if (!DataParser.isRequestData(dataParse)) {
        responseHandler(dataParse, client);
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
