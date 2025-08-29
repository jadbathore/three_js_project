var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import net from 'net';
import { RequestParser, ResponseParser } from '../../app/model/server/headParser.js';
import chalk from 'chalk';
const _array = [];
function oneCall(target, propertyKey, descriptor) {
    const orginalMethod = descriptor.value;
    descriptor.value = function (...args) {
        if (!_array.includes(propertyKey)) {
            _array.push(propertyKey);
            return orginalMethod.apply(this, args);
        }
    };
}
export class TCPServerSingleTone {
    constructor(port) {
        this._port = port;
        this.end();
    }
    get instanceClient() {
        if (!this._instanceClient) {
            this._instanceClient = this.createConnection(this._port);
        }
        return this._instanceClient;
    }
    static getInstance(port) {
        if (!TCPServerSingleTone._instance) {
            TCPServerSingleTone._instance = new TCPServerSingleTone(port);
        }
        return TCPServerSingleTone._instance;
    }
    createConnection(port) {
        const client = net.createConnection({ port: port }, () => {
            const requestHeader = {
                method: 'GET',
                path: '/',
                protocole: 'HTTP/1.1',
                host: 'localhost',
                headers: {
                    'Connection': 'Upgrade',
                    'Upgrade': 'tree-for-three',
                    'key-tree': '1234',
                }
            };
            const requestParse = new RequestParser(requestHeader);
            client.write(requestParse.request);
        });
        return client;
    }
    setData(callBack) {
        this.instanceClient.on('data', (data) => {
            const parser = new ResponseParser(data.toString());
            callBack(parser, this._instanceClient);
        });
    }
    end() {
        this.instanceClient.on('end', () => {
            console.log(chalk.yellow('Server TCP end'));
        });
    }
}
__decorate([
    oneCall
], TCPServerSingleTone.prototype, "setData", null);
__decorate([
    oneCall
], TCPServerSingleTone.prototype, "end", null);
