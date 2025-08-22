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
var serverStatus;
(function (serverStatus) {
    serverStatus["connect"] = "connect";
    serverStatus["disconnect"] = "disconnect";
    serverStatus["firstConnection"] = "first connection";
})(serverStatus || (serverStatus = {}));
export class ServerHandler {
    constructor(data, socketHandlerInterface, subject, app) {
        this._server = null;
        this._target = {
            route: ""
        };
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        ServerHandler._socketHandlerInterface = socketHandlerInterface;
        this.setRedisclient();
        this._app = app;
        this._proxy = new Proxy(this._target, this.serverProxyHandler());
        this._subject = subject;
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
                (e instanceof AggregateError);
                console.log((e instanceof AggregateError) ? chalk.yellow('redis is not connected you could use docker to have it !') : chalk.red('redis client err :', e));
                this._redisClient = null;
            }
        })();
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
                const routeKey = receiver[prop]?.route ?? receiver[prop];
                let type = function () {
                    let routeType;
                    switch (true) {
                        case (!receiver[prop].route):
                            routeType = serverStatus.firstConnection;
                            ServerHandler.accessAppRouter(newvalue, ServerHandler._socketHandlerInterface, serverStatus.firstConnection);
                            break;
                        case (routeKey != newvalue):
                            routeType = serverStatus.disconnect;
                            ServerHandler.accessAppRouter(receiver[prop]?.route ?? receiver[prop], ServerHandler._socketHandlerInterface, serverStatus.disconnect, newvalue);
                            break;
                        default:
                            routeType = serverStatus.connect;
                            if (receiver[prop]?.type == serverStatus.disconnect) {
                                console.log("reconnect");
                                ServerHandler.accessAppRouter(receiver[prop]?.route ?? receiver[prop], ServerHandler._socketHandlerInterface, serverStatus.connect);
                            }
                    }
                    return routeType;
                };
                target[prop] = {
                    route: newvalue,
                    type: type()
                };
                return true;
            }
        };
    }
    static accessAppRouter(targetOld, socket, serverEvent, targetNew) {
        switch (serverEvent) {
            case serverStatus.firstConnection:
                ServerHandler.handleSocketType(socket.handleFirstConnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                break;
            case serverStatus.connect:
                ServerHandler.handleSocketType(socket.handleConnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                break;
            case serverStatus.disconnect:
                ServerHandler.handleSocketType(socket.handleDeconnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                ServerHandler.handleSocketType(socket.handleConnection, ServerHandler._iteratorAggregate.getItem(targetNew));
                break;
            default: throw new Error(`unknow type:"${serverEvent}"`);
        }
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
            const file = await this.getFile(this._proxy.route.route);
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
        this._proxy.route = "/";
        app.use((req, res, next) => {
            if (req.path != '/.handler') {
                this._proxy.route = req.path;
                console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`));
            }
            next();
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
    runServer(app) {
        this._app.use(compression());
        express.static.mime.define({ 'application/wasm': ['wasm'] });
        this._app.enable('etag');
        this._app.set('view engine', 'ejs');
        this._app.set('views', PathUtility.getViewerFile());
        this._app.use(express.static('app/public', optionServer));
        const port = process.env.EXPRESS_PORT || 3001;
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, this._app) : this._app;
        this.initWatcher(this._app);
        this.createRoute(this._app);
        this.serverWatcher(this._app);
        rollupWatchConfig();
        this._server = server.listen(port, () => {
            const serverType = (server instanceof https.Server) ? "https" : "http";
            const url = `${serverType}://localhost:${port}/`;
            console.log(chalk.greenBright(boxen(`Server running on:\u001B]8;;${url}\u0007${port}\u001B]8;;\u0007`, {
                padding: 1,
            })));
        });
    }
    shutDown(path) {
        this._server.close(() => {
            fs.copyFileSync("app/public/dist/compling.js", path);
            process.exit(1);
        });
    }
}
