import { RequestMethod } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import express from "express";
import PathUtility from "../CompilerSetUp/Utility/pathUtility.js";
import { optionServer } from "../../server/optionStaticFileExpress.js";
import fs from 'fs';
import { createClient } from 'redis';
import https from 'https';
import chalk from "chalk";
import boxen from 'boxen';
import compression from "compression";
import { rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
import http from "http";
var serverStatus;
(function (serverStatus) {
    serverStatus["connect"] = "connect";
    serverStatus["disconnect"] = "disconnect";
    serverStatus["firstConnection"] = "first connection";
})(serverStatus || (serverStatus = {}));
export var responseAction;
(function (responseAction) {
    responseAction["redirection"] = "redirect";
})(responseAction || (responseAction = {}));
const debug = true;
function skipMiddleWare(callBack) {
    return function (target, propertyKey, descriptor) {
        const orginalMethod = descriptor.value;
        descriptor.value = function (...args) {
            if (callBack(args[0], args[1])) {
                return orginalMethod.apply(this, [args[0], args[1]]);
            }
        };
        return descriptor;
    };
}
export class ServerHandler {
    constructor(data, socketHandlerInterface, subject, app, port) {
        this._serverConnection = null;
        this._target = {
            route: ""
        };
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        ServerHandler._socketHandlerInterface = socketHandlerInterface;
        rollupWatchConfig();
        this.setRedisclient();
        this._subject = subject;
        this._proxy = new Proxy(this._target, this.serverProxyHandler());
        this._port = (this.fourdigitPort(port)) ? port : 1000;
        this._app = this.setApp(app);
        this._server = this.setServer(this._app);
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
    static isExpressRequest(obj) {
        if (typeof obj == 'string')
            return false;
        return true;
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
                console.log(receiver[prop]);
                const routeValue = (ServerHandler.isExpressRequest(newvalue)) ? newvalue.path : newvalue;
                switch (true) {
                    case (target[prop] == ''):
                        ServerHandler.accessAppRouter(routeValue, ServerHandler._socketHandlerInterface, serverStatus.firstConnection);
                        target[prop] = { route: newvalue, type: serverStatus.firstConnection };
                        return true;
                    case (routeValue != receiver[prop].route):
                        console.log(routeValue, receiver[prop].route);
                        ServerHandler.accessAppRouter(target?.route ?? target, ServerHandler._socketHandlerInterface, serverStatus.disconnect, routeValue);
                        target[prop] = { route: routeValue, type: serverStatus.disconnect };
                        return true;
                    default:
                        if (ServerHandler.isExpressRequest(newvalue) && receiver[prop].type != serverStatus.connect) {
                            ServerHandler.accessAppRouter(newvalue, ServerHandler._socketHandlerInterface, serverStatus.connect);
                        }
                        target[prop] = { route: routeValue, type: serverStatus.connect };
                        return true;
                }
            }
        };
    }
    static accessAppRouter(targetOld, socket, serverEvent, targetNew) {
        if (!this.isExpressRequest(targetOld)) {
            switch (serverEvent) {
                case serverStatus.firstConnection:
                    ServerHandler.handleSocketType(socket.handleReconnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                    break;
                case serverStatus.disconnect:
                    ServerHandler.handleSocketType(socket.handleReconnection, ServerHandler._iteratorAggregate.getItem(targetNew));
                    ServerHandler.handleSocketType(socket.handleDeconnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                    break;
                default: throw new Error(`unknow type:"${serverEvent}"`);
            }
        }
        else {
            ServerHandler.handleSocketType(socket.handleConnection, ServerHandler._iteratorAggregate.getItem(targetOld.path), targetOld);
        }
    }
    static handleSocketType(callback, item, request) {
        if (item?.CompilerTuple ?? false) {
            callback(item, request);
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
        app.use('/.reload', (req, res, next) => {
            setTimeout(() => {
                res.write("window.location.href = '/'");
            }, 5000);
            next();
        });
        app.use('/.handler', async (req, res, next) => {
            const file = await this.getFile(this._proxy.route.route);
            res.send(file).status(200);
            next();
        });
    }
    restartProxy() {
        this._proxy.route = "";
    }
    initWatcher(app) {
        const iterator = ServerHandler._iteratorAggregate.getIterator();
        do {
            const routeObj = iterator.current();
            if (fs.existsSync(PathUtility.pathofElementWithPoint(routeObj.scene))) {
                iterator.addCompilerTuple(this._subject);
            }
        } while (iterator.valid());
        const setAction = (req, res, next) => {
            if (req.action == undefined) {
                req.action = {
                    payload: null,
                    type: null
                };
            }
            next();
        };
        this._proxy.route = "/";
        const setProxy = (req, res, next) => {
            if (req.path != '/.handler') {
                this._proxy.route = req;
                console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`));
            }
            console.log("middleware2", req.path);
            next();
        };
        app.use(setAction, setProxy);
        app.post("/reload", (req, res) => {
            res.redirect('/');
        });
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
    websocket() {
        http.createServer((req, res) => { });
    }
    setServer(app) {
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, app) : http.createServer(app);
        return server;
    }
    runServer(app) {
        this._app.use(compression());
        express.static.mime.define({ 'application/wasm': ['wasm'] });
        this._app.enable('etag');
        this._app.set('view engine', 'ejs');
        this._app.set('views', PathUtility.getViewerFile());
        this._app.use(express.static('app/public', optionServer));
        const port = (process.env.EXPRESS_PORT || 3000);
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, this._app) : this._app;
        this.initWatcher(this._app);
        this.serverWatcher(this._app);
        this.createRoute(this._app);
        this.tryPort(port).then((port_correction) => {
            this._serverConnection = server.listen(port_correction, () => {
                const serverType = (server instanceof https.Server) ? "https" : "http";
                const url = `${serverType}://localhost:${port_correction}/`;
                console.log(chalk.greenBright(boxen(`Server running on:\u001B]8;;${url}\u0007${port_correction}\u001B]8;;\u0007`, {
                    padding: 1,
                })));
            });
        });
    }
    upgradeServeur() {
        this._server.on('upgrade', (req, socket, head) => {
            const { upgrade: upgrade, 'key-tree': treeKey } = req.headers;
            if (upgrade === 'tree-for-three' && treeKey == '1234') {
                console.log('tree-for-three protocole active');
                socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
                    'Connection: Upgrade\r\n' +
                    'Upgrade: tree-for-three\r\n\r\n');
                socket.on('data', (data) => {
                    console.log(data.toString());
                });
            }
            else {
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
        });
    }
    run() {
        this.tryPort(this._port).then((port_correction) => {
            this.upgradeServeur();
            this._serverConnection = this._server.listen(port_correction, () => {
                const serverType = (this._server instanceof https.Server) ? "https" : "http";
                const url = `${serverType}://localhost:${port_correction}/`;
                console.log(chalk.greenBright(boxen(`Server running on:\u001B]8;;${url}\u0007${port_correction}\u001B]8;;\u0007`, {
                    padding: 1,
                })));
            });
        });
    }
    restartServer() {
        this._serverConnection.close();
        this.restartProxy();
        this.run();
    }
    shutDown(path) {
        this._serverConnection.close(() => {
            fs.copyFileSync("app/public/dist/compling.js", path);
            process.exit(1);
        });
    }
}
