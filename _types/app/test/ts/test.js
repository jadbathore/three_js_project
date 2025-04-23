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
import { CompilerWatchSubject } from "../../model/oberserver/oberserver.js";
const target = {
    route: "hello",
};
var serverStatus;
(function (serverStatus) {
    serverStatus["connect"] = "connect";
    serverStatus["disconnect"] = "disconnect";
    serverStatus["firstConnection"] = "first connection";
})(serverStatus || (serverStatus = {}));
class a {
    handleConnection(appRouter) {
        const [compiler, Observer] = appRouter.CompilerTuple;
        compiler.compile();
    }
    handleDeconnection(appRouter) {
        const [compiler, Observer] = appRouter.CompilerTuple;
        compiler.DestructCompiler();
    }
}
class TestServer {
    constructor(data, socketHandlerInterface, subject) {
        this._target = {
            route: "/"
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
                    switch (target[prop]?.type ?? serverStatus.firstConnection) {
                        case serverStatus.firstConnection:
                        case serverStatus.connect:
                            TestServer._socketHandlerInterface.handleConnection(TestServer._iteratorAggregate.getItem(target[prop]?.route ?? target[prop]));
                            break;
                        case serverStatus.disconnect:
                            TestServer._socketHandlerInterface.handleDeconnection(TestServer._iteratorAggregate.getItem(target[prop]?.route ?? target[prop]));
                            break;
                        default: throw new Error("unknow type :" + target[prop].type);
                    }
                    return target[prop];
                }
                return target;
            },
            set: function (target, prop, newvalue, receiver) {
                target[prop] = {
                    route: newvalue,
                    type: (receiver[prop]?.route === newvalue) ? serverStatus.connect : serverStatus.disconnect,
                };
                return true;
            }
        };
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
            console.log(`${req.method} on "${req.path}" at ${new Date(Date.now()).toString()}`);
            next();
        });
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
const z = new a();
const s = new CompilerWatchSubject();
const Tser = new TestServer(router, z, s);
const app = express();
Tser.runServer(app);
