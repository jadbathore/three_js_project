import chalk from "chalk";
import { DataParser } from "../model/server/headParser.js";
import { TLSClientSingleTone, TCPServerSingleTone } from "../model/server/client.js";
import { responseHandler } from "../model/server/headHandler.js";
import PathUtility from "../model/CompilerSetUp/Utility/pathUtility.js";
let clientInstance;
const key = PathUtility.getKeyBuffer();
const perm = PathUtility.getCertBuffer();
if (key && perm) {
    clientInstance = TLSClientSingleTone.getInstance(3000, 'localhost', 8080);
}
else {
    clientInstance = TCPServerSingleTone.getInstance(3000, 8080);
}
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
clientInstance.setData(dataCallBack);
clientInstance.setEnd(() => {
    console.log(chalk.bgYellow('Serveur TCP Ended'));
    process.exit(1);
});
