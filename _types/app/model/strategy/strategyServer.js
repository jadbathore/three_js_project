import express from "express";
import fs from 'fs';
import https from 'https';
import { createServer } from "node:http";
import compression from 'compression';
import connectLiveReload from 'connect-livereload';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import { RequestMethod } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import { optionServer } from '../../server/optionStaticFileExpress.js';
import { CompilerWatchSubject, ObserverWatch } from '../oberserver/oberserver.js';
import { Compiler, rollupWatchConfig } from "../CompilerSetUp/Compiler.js";
import { Server as ioServer } from 'socket.io';
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import chalk from "chalk";
import boxen from "boxen";
var serverStatus;
(function (serverStatus) {
    serverStatus["connect"] = "connect";
    serverStatus["disconnect"] = "disconnect";
})(serverStatus || (serverStatus = {}));
export class Context {
    constructor(strategy) {
        this._serverEvent = [];
        this._strategy = strategy;
        this._subject = new CompilerWatchSubject();
        this._proxyHandler = this.setServerEventProxy();
        this.setProxy();
    }
    setStrategy(strategy) {
        this._strategy = strategy;
    }
    runServer() {
        rollupWatchConfig();
        const app = express();
        app.use(compression());
        app.use(connectLiveReload());
        app.set('view engine', 'ejs');
        app.set('views', PathUtility.getViewerFile());
        app.use(express.static('app/public', optionServer));
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, app) : createServer(app);
        const pubClient = createClient({ url: "redis://lacalhost:6379" });
        const subClient = pubClient.duplicate();
        const io = new ioServer(server);
        io.adapter(createAdapter(pubClient, subClient));
        const port = process.env.EXPRESS_PORT || 3004;
        this.serverWatcher(app);
        this._strategy.doAlgorithm(app, this._subject, this._proxy);
        server.listen(port, () => {
            console.log(chalk.greenBright(boxen(`Server is running on port : ${port}`, {
                padding: 1,
            })));
        });
    }
    setServerEventProxy() {
        return {
            get: function (target, p, receiver) {
                if (p) {
                    const index = parseInt(p);
                    return target[index];
                }
                return target;
            },
            set: function (target, p, newvalue, receiver) {
                const index = parseInt(p);
                target[index] = newvalue;
                return true;
            }
        };
    }
    setProxy() {
        const _array = [];
        const proxyServerEvent = new Proxy(this._serverEvent, this._proxyHandler);
        Object.defineProperty(proxyServerEvent, 'push', {
            value: function () {
                const EventServer = { route: arguments[0], type: serverStatus.connect };
                if (EventServer)
                    _array.push(EventServer);
            },
            writable: true,
            configurable: true
        });
        this._proxy = _array;
    }
    serverWatcher(app) {
        app.use((req, res, next) => {
            this._proxy.push(req.path);
            next();
        });
    }
}
export class ServerStrategy {
    constructor(data) {
        this._compilerArray = [];
        this._data = data;
    }
    doAlgorithm(app, subject, test) {
        const collection = new ServerRouteAggregate(this._data);
        const iterator = collection.getIterator();
        while (iterator.valid()) {
            const routeObj = iterator.next();
            if (routeObj.method != RequestMethod.middleWare) {
                if (routeObj.scene) {
                    const oberserver = new ObserverWatch(routeObj.pathServer);
                    const compiler = new Compiler(oberserver, subject, routeObj.scene);
                    compiler.compile();
                }
                app[routeObj.method](routeObj.pathServer, routeObj.serverLogic);
            }
            else {
                app[routeObj.method](routeObj.serverLogic);
            }
        }
    }
}
