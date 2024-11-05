var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import chalk from 'chalk';
var StatutsConnection;
(function (StatutsConnection) {
    StatutsConnection["Connected"] = "connected";
    StatutsConnection["In_waiting_connection"] = "wait";
    StatutsConnection["discontinued"] = "discontinued";
    StatutsConnection["Error_connection"] = "error";
})(StatutsConnection || (StatutsConnection = {}));
class ClassObjectMongooseModel {
    constructor() { }
    static get instance() {
        if (!ClassObjectMongooseModel._instance) {
            ClassObjectMongooseModel._instance = new ClassObjectMongooseModel();
        }
        return ClassObjectMongooseModel._instance;
    }
    setObject(object) {
        if (!this._object) {
            this._object = object;
        }
    }
    get object() {
        return this._object;
    }
}
export class ConnectionUtilityMongoDB {
    constructor(uri) {
        this._status = StatutsConnection.In_waiting_connection;
        this.instanceMongooseModel = ClassObjectMongooseModel.instance;
        this._uri = uri;
    }
    get status() {
        return this._status;
    }
    tryConnection() {
        let status;
        const promisePendingStatus = new Promise((resolve) => {
            setTimeout(() => {
                status = StatutsConnection.discontinued;
                resolve(status);
            }, 3000);
            mongoose.connect(this._uri).then(() => {
                status = StatutsConnection.Connected;
            }).catch(() => {
                status = StatutsConnection.Error_connection;
            }).finally(() => {
                resolve(status);
            });
        });
        return promisePendingStatus;
    }
    setStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            this._status = yield this.tryConnection();
        });
    }
    MakeSchemaPromise() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStatus();
            const PromisePending = new Promise((resolve, rejects) => {
                if (this._status == StatutsConnection.Connected) {
                    const schemas = this.makeSchema();
                    resolve(schemas);
                }
                else {
                    rejects('the data base is not connected');
                }
            });
            return PromisePending;
        });
    }
    makeSchema() {
        return {
            versions: new mongoose.Schema({
                versionName: String,
                name: String,
                date: { type: Date, default: Date.now },
                content: String
            }),
            single: new mongoose.Schema({
                versionName: String,
                name: String,
                date: { type: Date, default: Date.now },
                content: String
            }),
            usable: new mongoose.Schema({
                UsableName: String,
                name: String,
                date: { type: Date, default: Date.now },
                content: {}
            })
        };
    }
    createModelPromise() {
        const objectModule = {};
        const promisePendingModel = new Promise((resolve, reject) => {
            this.MakeSchemaPromise().then((objectSchema) => {
                if (!this.instanceMongooseModel.object) {
                    for (const [key, value] of Object.entries(objectSchema)) {
                        objectModule[key] = mongoose.model(key, value);
                    }
                    const ReadOnlyModel = objectModule;
                    this.instanceMongooseModel.setObject(ReadOnlyModel);
                }
                resolve(this.instanceMongooseModel.object);
            }).catch((err) => {
                console.log(chalk.bgRed(err));
                reject("no schema were found...");
            });
        });
        return promisePendingModel;
    }
    resulthandler(result) {
        return (result.length == 0) ? null : result;
    }
    findObject(tableName, query) {
        const promise = this.createModelPromise().then((Object) => __awaiter(this, void 0, void 0, function* () {
            const TableModel = Object[tableName];
            let result = (typeof query !== 'undefined') ? yield TableModel.find().where(query) : yield TableModel.find();
            return this.resulthandler(result);
        })).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    findLastObject(tableName) {
        const promise = this.createModelPromise().then((Object) => __awaiter(this, void 0, void 0, function* () {
            const TableModel = Object[tableName];
            let result = yield TableModel.find().sort({ _id: -1 }).limit(1);
            return this.resulthandler(result);
        })).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    UpdateObject(tableName, query, update) {
        const promise = this.createModelPromise().then((Object) => __awaiter(this, void 0, void 0, function* () {
            const TableModel = Object[tableName];
            yield TableModel.findOneAndUpdate(query, update);
        })).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    saveObject(tableName) {
        const promise = this.createModelPromise().then((Object) => __awaiter(this, void 0, void 0, function* () {
            const TableModel = Object[tableName];
            return TableModel;
        })).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    DeleteObject(tableName, query) {
        const promise = this.createModelPromise().then((Object) => __awaiter(this, void 0, void 0, function* () {
            const TableModel = Object[tableName];
            yield TableModel.findOneAndDelete(query);
        })).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    testTheConnectionPromise() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStatus();
            const PromisePending = new Promise((resolve, rejects) => {
                if (this._status == StatutsConnection.Connected) {
                    resolve(this._status);
                }
                else {
                    rejects(this._status);
                }
            });
            return PromisePending;
        });
    }
    testConnnectionAwaited(spinner) {
        this.testTheConnectionPromise().then((status) => {
            spinner.succeed(`status:" ${chalk.green(status)} "`);
            console.log(chalk.green('\nThe status mean that the connection is good and ready to roll'));
        }).catch((status) => {
            spinner.fail(`status:" ${chalk.red(status)} "`);
            switch (status) {
                case StatutsConnection.discontinued:
                    console.log(chalk.red('\nThis status mean that the connection was aborted because the connection time is too long', '\ncheck if your mongoDB service is running.'));
                    break;
                case StatutsConnection.Error_connection:
                    console.log(chalk.red('\nThis status mean that the connection has a error', 'please check the uri you provide :'), chalk.yellow(this._uri));
                    break;
                default: console.log(chalk.bgRed('\ninternal error please refer your issue to', 'https://github.com/jadbathore/three_js_project/issues'));
            }
        }).finally(() => {
            process.exit();
        });
    }
}
//# sourceMappingURL=dbConnection.js.map