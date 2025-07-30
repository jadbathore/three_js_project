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
    constructor(data, socketHandlerInterface, subject) {
        this._target = {
            route: ""
        };
        ServerHandler._iteratorAggregate = new ServerRouteAggregate(data);
        ServerHandler._socketHandlerInterface = socketHandlerInterface;
        this.setRedisclient();
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
                console.log(chalk.red('redis client not connected err :', e));
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
                const routeType = (receiver[prop].route) ? serverStatus.connect : serverStatus.firstConnection;
                if (routeKey != newvalue) {
                    ServerHandler.accessAppRouter(receiver[prop]?.route ?? receiver[prop], ServerHandler._socketHandlerInterface, serverStatus.disconnect, newvalue);
                }
                else {
                    if ((target[prop]?.type) != serverStatus.firstConnection) {
                        ServerHandler.accessAppRouter(receiver[prop]?.route ?? receiver[prop], ServerHandler._socketHandlerInterface, routeType);
                    }
                }
                target[prop] = {
                    route: newvalue,
                    type: routeType
                };
                return true;
            }
        };
    }
    static accessAppRouter(targetOld, socket, serverEvent, targetNew) {
        switch (serverEvent) {
            case serverStatus.connect:
                ServerHandler.handleSocketType(socket.handleConnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                break;
            case serverStatus.disconnect:
                ServerHandler.handleSocketType(socket.handleDeconnection, ServerHandler._iteratorAggregate.getItem(targetOld));
                ServerHandler.handleSocketType(socket.handleConnection, ServerHandler._iteratorAggregate.getItem(targetNew));
                break;
            case serverStatus.firstConnection: break;
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
                if (fs.existsSync(PathUtility.pathofElementWithPoint(routeObj.scene))) {
                    iterator.addCompilerTuple(this._subject);
                }
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
    async setFile(key) {
        const file = fs.readFileSync(PathUtility.dist);
        await this._redisClient.set(key, file);
    }
    async getFile(key) {
        return await this._redisClient?.get(key) ?? fs.readFileSync(PathUtility.dist, 'utf-8');
    }
    runServer(app) {
        rollupWatchConfig();
        app.use(compression());
        express.static.mime.define({ 'application/wasm': ['wasm'] });
        app.enable('etag');
        app.set('view engine', 'ejs');
        app.set('views', PathUtility.getViewerFile());
        app.use(express.static('app/public', optionServer));
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, app) : app;
        const port = process.env.EXPRESS_PORT || 3001;
        this.serverWatcher(app);
        this.createRoute(app);
        server.listen(port, () => {
            const serverType = (server instanceof https.Server) ? "https" : "http";
            const url = `${serverType}://localhost:${port}/`;
            console.log(chalk.greenBright(boxen(`Server running on:\u001B]8;;${url}\u0007${port}\u001B]8;;\u0007`, {
                padding: 1,
            })));
        });
    }
}
