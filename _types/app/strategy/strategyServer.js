import express from "express";
import fs from 'fs';
import https from 'https';
import compression from 'compression';
import connectLiveReload from 'connect-livereload';
import PathUtility from '../CompilerSetUp/Utility/pathUtility.js';
import { ServerRouteAggregate } from "../iterator/iteratorServer.js";
import { optionServer } from '../server/optionStaticFileExpress.js';
import { CompilerWatchSubject, ObserverWatch } from '../oberserver/oberserver.js';
export class Context {
    constructor(strategy) {
        this._strategy = strategy;
        this._subject = new CompilerWatchSubject();
    }
    setStrategy(strategy) {
        this._strategy = strategy;
    }
    runServer() {
        const app = express();
        app.use(compression());
        app.use(connectLiveReload());
        app.set('view engine', 'ejs');
        app.set('views', PathUtility.getViewerFile());
        app.use(express.static('app/public', optionServer));
        const key = (fs.existsSync(PathUtility.keySLL)) ? fs.readFileSync(PathUtility.keySLL) : null;
        const cert = (fs.existsSync(PathUtility.certSLL)) ? fs.readFileSync(PathUtility.certSLL) : null;
        const server = (key && cert) ? https.createServer({ key: key, cert: cert }, app) : app;
        const port = process.env.EXPRESS_PORT || 3004;
        this._strategy.doAlgorithm(app);
        server.listen(port, () => {
            console.log(`server running on port : ${port}`);
        });
    }
}
export class ServerStrategy {
    constructor(data) {
        this._data = data;
    }
    doAlgorithm(app) {
        const collection = new ServerRouteAggregate(this._data);
        const iterator = collection.getIterator();
        while (iterator.valid()) {
            const routeObj = iterator.next();
            const ExpressRouter = express.Router();
            if (routeObj.method != RequestMethod.middleWare) {
                if (routeObj.scene) {
                    const oberserver = new ObserverWatch(routeObj.pathServer);
                }
                ExpressRouter[routeObj.method](routeObj.pathServer, routeObj.serverLogic);
            }
            else {
                ExpressRouter[routeObj.method](routeObj.serverLogic);
            }
        }
        app.use([]);
    }
}
