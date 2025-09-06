import chalk from "chalk";
import { DataParser } from "../model/server/headParser.js";
import { TLSClientSingleTone, TCPServerSingleTone } from "../model/server/client.js";
import { responseHandler } from "../model/server/headHandler.js";
import PathUtility from "../model/CompilerSetUp/Utility/pathUtility.js";
import { TLSSocket } from "tls";
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
function endCallBack(client, webSocket) {
    const protocole = (client instanceof TLSSocket) ? 'TLS' : 'TCP';
    console.log(chalk.bgYellow(`Serveur ${protocole} Ended`));
    process.exit(1);
}
function errorCallback(error) {
    console.log(error.message);
}
function setCallBacks(interfaceClient) {
    interfaceClient.setData(dataCallBack);
    interfaceClient.setEnd(endCallBack);
    interfaceClient.setError(errorCallback);
}
let clientInstance;
const key = PathUtility.getKeyBuffer();
const perm = PathUtility.getCertBuffer();
if (key && perm) {
    clientInstance = TLSClientSingleTone.getInstance(3000, 'localhost', 8080);
    setCallBacks(clientInstance);
}
else {
    clientInstance = TCPServerSingleTone.getInstance(3000, 8080);
    setCallBacks(clientInstance);
}
