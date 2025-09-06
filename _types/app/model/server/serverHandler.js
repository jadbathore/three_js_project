import { RequestMethod } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import express from "express";
import PathUtility from "../CompilerSetUp/Utility/pathUtility.js";
import { optionServer } from "../../server/optionStaticFileExpress.js";
import fs from 'fs';
import { createClient } from 'redis';
import chalk from "chalk";
import boxen from 'boxen';
import compression from "compression";
import { rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
import http from "http";
import { DataParser, ResponseParser } from "./headParser.js";
import { SocketTree, TLSServerSingleTone } from "./client.js";
import { SocketImplement } from "../../server/serverHandler/socketImplement.js";
import { responseHandler } from "./headHandler.js";
import { TLSSocket } from "tls";
var serverStatus;
(function (serverStatus) {
    serverStatus["connect"] = "connect";
    serverStatus["disconnect"] = "disconnect";
    serverStatus["firstConnection"] = "first connection";
})(serverStatus || (serverStatus = {}));
export class ServerHandler {
    constructor(data, subject, app, port) {
        this._target = {
            route: ""
        };
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        rollupWatchConfig();
        this.setRedisclient();
        this._subject = subject;
        ServerHandler._proxy = new Proxy(this._target, this.serverProxyHandler());
        this._port = (this.fourdigitPort(port)) ? port : 1000;
        this._app = this.setApp(app);
        this._server = this.setServer(this._app);
        this.upgradeServeur();
    }
    setRedisclient() {
        (async () => {
            try {
                this._redisClient = await createClient({ url: process.env.REDIS_URL })
                    .on('error', (error) => {
                    throw error;
                })
                    .on('connect', () => {
                    console.log(chalk.keyword('lightgreen')('redis client connected'));
                })
                    .connect();
            }
            catch (e) {
                console.log((e instanceof AggregateError) ? chalk.yellow('redis is not connected you could use docker to have it.') : chalk.red('redis client err :', e));
                this._redisClient = null;
            }
        })();
    }
    fourdigitPort(value) {
        return Number.isInteger(value) && value >= 1000 && value <= 9999;
    }
    serverProxyHandler() {
        return {
            get: function (target, prop) {
                if (prop) {
                    return target[prop];
                }
                return target;
            },
            set: function (target, prop, newvalue, receiver) {
                const { route: oldRoute, type: oldType } = target;
                target['route'] = newvalue;
                if (ServerHandler._socketHandlerInterface) {
                    let currentStatus;
                    switch (true) {
                        case (typeof oldType == 'undefined'):
                            currentStatus = serverStatus.firstConnection;
                            ServerHandler.accessAppRouterHandle(newvalue, ServerHandler._socketHandlerInterface);
                            break;
                        case (oldRoute != newvalue):
                            currentStatus = serverStatus.disconnect;
                            ServerHandler.accessAppRouterHandle(newvalue, ServerHandler._socketHandlerInterface, oldRoute);
                            break;
                        default:
                            currentStatus = serverStatus.connect;
                    }
                    target['type'] = currentStatus;
                }
                return true;
            }
        };
    }
    static accessAppRouterHandle(nextTarget, socket, currentTarget) {
        if (currentTarget) {
            const appRouterCurrent = ServerHandler._iteratorAggregate.getItem(currentTarget);
            this.handleSocketType(socket.handleDeconnection, appRouterCurrent);
        }
        const appRouterNext = ServerHandler._iteratorAggregate.getItem(nextTarget);
        this.handleSocketType(socket.handleReconnection, appRouterNext);
        this.handleSocketType(socket.handleConnection, appRouterNext);
    }
    static handleSocketType(callback, item) {
        if (item?.CompilerTuple ?? false) {
            callback(item);
        }
    }
    createRoute(app) {
        const iterator = ServerHandler._iteratorAggregate.getIterator();
        do {
            const routeObj = iterator.current();
            if (routeObj.method != RequestMethod.middleWare) {
                app[routeObj.method](routeObj.pathServer, routeObj.serverLogic);
            }
            else {
                app[routeObj.method](routeObj.serverLogic);
            }
        } while (iterator.valid());
    }
    serverWatcher(app) {
        app.use('/.handler', async (req, res, next) => {
            const file = await this.getFile(ServerHandler._proxy.route);
            res.send(file).status(200);
            next();
        });
    }
    initWatcher(app) {
        const iterator = ServerHandler._iteratorAggregate.getIterator();
        do {
            const routeObj = iterator.current();
            if (fs.existsSync(PathUtility.pathofElementWithPoint(routeObj.scene))) {
                iterator.addCompilerTuple(this._subject);
            }
        } while (iterator.valid());
        const setProxy = (req, res, next) => {
            if (req.path != '/.handler') {
                ServerHandler._proxy.route = req.path;
                console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`));
            }
            next();
        };
        app.use(setProxy);
    }
    async setFile(key) {
        console.log("get file" + key);
        const file = fs.readFileSync(PathUtility.dist);
        await this._redisClient.set(key, file);
        return file.toString();
    }
    async getFile(key) {
        if (this._redisClient) {
            return await this._redisClient?.get(key) ?? await this.setFile(key);
        }
        else {
            return fs.promises.readFile(PathUtility.dist, 'utf-8');
        }
    }
    async tryPort(port) {
        while (true) {
            const connectionAtempt = await new Promise((resolve, reject) => {
                const testPort = http.createServer()
                    .once('error', (err) => {
                    if (err.code == 'EADDRINUSE') {
                        resolve(true);
                    }
                    else {
                        reject(err.message);
                    }
                }).once('listening', () => {
                    testPort.close();
                    resolve(false);
                }).listen(port);
            });
            if (connectionAtempt) {
                port = port + 1;
            }
            else {
                break;
            }
        }
        return port;
    }
    setApp(app) {
        app.use(compression());
        express.static.mime.define({ 'application/wasm': ['wasm'] });
        app.enable('etag');
        app.set('view engine', 'ejs');
        app.set('views', PathUtility.getViewerFile());
        app.use(express.static('app/public', optionServer));
        this.initWatcher(app);
        this.serverWatcher(app);
        this.createRoute(app);
        return app;
    }
    setServer(app) {
        const key = PathUtility.getKeyBuffer();
        const cert = PathUtility.getCertBuffer();
        const httpServer = http.createServer(app);
        if (key && cert) {
            const certification = { key: key, cert: cert };
            const serverArguments = {
                port: this._port,
                server: httpServer,
                host: 'localhost',
                certificate: certification
            };
            const instanceTls = TLSServerSingleTone.getInstance(serverArguments);
            return instanceTls;
        }
        return httpServer;
    }
    setCallBacks(iterfaceServer) {
        iterfaceServer.setData(this.dataCallBack);
        iterfaceServer.setEnd(this.endCallBack);
        iterfaceServer.setError(this.errorCallBack);
    }
    dataCallBack(data, instance) {
        if (DataParser.isRequestData(data)) {
            const responseArgs = {
                protocole: data.protocole,
                code: ResponseParser.tryCode(303),
                message: 'OK',
            };
            const responseParser = new ResponseParser(responseArgs);
            instance.write(responseParser.response);
            ServerHandler._proxy.route = data.path;
        }
        else {
            responseHandler(data, instance);
        }
    }
    endCallBack(instance) {
        const clientProtocole = (instance instanceof TLSSocket) ? 'TLS' : 'TCP';
        console.log(chalk.bgYellow(`connection to ${clientProtocole} ended`));
    }
    errorCallBack(error) {
        console.log(error.message);
    }
    upgradeServeur() {
        if (this._server instanceof TLSServerSingleTone) {
            this.setCallBacks(this._server);
        }
        else {
            this._server.on('upgrade', (req, socket, head) => {
                const { upgrade: upgrade, 'key-tree': treeKey } = req.headers;
                if (upgrade === 'tree-for-three' && treeKey == process.env.PASSWORD_TCP) {
                    const instance = SocketTree.getInstance(socket);
                    const responseArgs = {
                        protocole: 'HTTP/1.1',
                        code: ResponseParser.tryCode(101),
                        message: 'Switching Protocols',
                        headers: {
                            Connection: "Upgrade",
                            Upgrade: "tree-for-three",
                            'to-compile': ServerHandler._proxy.route
                        }
                    };
                    const responseParser = new ResponseParser(responseArgs);
                    instance.writeToSocket(responseParser.response);
                    console.log(chalk.bgGreen('Serveur Has been upgraded'));
                    ServerHandler._socketHandlerInterface = new SocketImplement(instance);
                    this.setCallBacks(instance);
                }
                else {
                    console.log(chalk.bgRed('Something went wrong during the upgrade'));
                    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                }
            });
        }
    }
    startServerCallBack(port) {
        const callback = () => {
            const serverType = (this._server instanceof http.Server) ? "http" : "https";
            const url = `${serverType}://localhost:${port}/`;
            console.log(chalk.greenBright(boxen(`Server running on:\u001B]8;;${url}\u0007${port}\u001B]8;;\u0007`, {
                padding: 1,
            })));
        };
        return callback;
    }
    run() {
        this.tryPort(this._port).then((port_correction) => {
            this._server.listen(port_correction, this.startServerCallBack(port_correction));
        });
    }
    shutDown(output) {
        fs.copyFileSync(PathUtility.dist, output);
        process.exit(1);
    }
}
