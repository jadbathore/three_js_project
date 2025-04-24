import express from "express";
import fs from 'fs';
import https from 'https';
import compression from "compression";
import chalk from "chalk";
import boxen from "boxen";
import { RequestMethod, router } from "../../route/routeur.js";
import { ServerRouteAggregate } from "../../model/iterator/iteratorServer.js";
import PathUtility from "../../model/CompilerSetUp/Utility/pathUtility.js";
import { optionServer } from "../../server/optionStaticFileExpress.js";
import { CompilerWatchSubject, proxyObserver } from "../../model/oberserver/oberserver.js";
var serverStatus;
(function (serverStatus) {
    serverStatus["connect"] = "connect";
    serverStatus["disconnect"] = "disconnect";
    serverStatus["firstConnection"] = "first connection";
})(serverStatus || (serverStatus = {}));
class Socket {
    handleConnection({ CompilerTuple: [compiler, oberserver] }) {
        compiler.compile();
        proxyObserver(oberserver, (event, path, proxy) => {
            console.log(event, path, proxy);
        });
    }
    handleDeconnection({ CompilerTuple: [compiler, oberserver] }) {
        compiler.DestructCompiler();
    }
}
class TestServer {
    constructor(data, socketHandlerInterface, subject) {
        this._target = {
            route: ""
        };
        TestServer._iteratorAggregate = new ServerRouteAggregate(data);
        TestServer._socketHandlerInterface = socketHandlerInterface;
        this._proxy = new Proxy(this._target, this.serverProxyHandler());
        this._subject = subject;
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
                console.log(routeKey, newvalue, routeType);
                if (routeKey != newvalue) {
                    TestServer.accessAppRouter(receiver[prop]?.route ?? receiver[prop], TestServer._socketHandlerInterface, serverStatus.disconnect, newvalue);
                }
                else {
                    if ((target[prop]?.type) != serverStatus.firstConnection) {
                        TestServer.accessAppRouter(receiver[prop]?.route ?? receiver[prop], TestServer._socketHandlerInterface, routeType);
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
                TestServer.handleSocketType(socket.handleConnection, TestServer._iteratorAggregate.getItem(targetOld));
                break;
            case serverStatus.disconnect:
                TestServer.handleSocketType(socket.handleDeconnection, TestServer._iteratorAggregate.getItem(targetOld));
                TestServer.handleSocketType(socket.handleConnection, TestServer._iteratorAggregate.getItem(targetNew));
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
        const iterator = TestServer._iteratorAggregate.getIterator();
        do {
            const routeObj = iterator.current();
            if (routeObj.method != RequestMethod.middleWare) {
                if (fs.existsSync(routeObj.scene)) {
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
        app.use((req, res, next) => {
            this._proxy.route = req.path;
            console.log(chalk.blue(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`));
            next();
        });
    }
    async *test(res) {
    }
    runServer(app) {
        app.use(compression());
        app.set('view engine', 'ejs');
        app.set('views', PathUtility.getViewerFile());
        app.use(express.static('app/public', optionServer));
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, app) : app;
        const port = process.env.EXPRESS_PORT || 3004;
        this.serverWatcher(app);
        this.createRoute(app);
        server.listen(port, () => {
            console.log(chalk.greenBright(boxen(`Server is running on port : ${port}`, {
                padding: 1,
            })));
        });
    }
}
const z = new Socket();
const s = new CompilerWatchSubject();
const Tser = new TestServer(router, z, s);
const app = express();
Tser.runServer(app);
