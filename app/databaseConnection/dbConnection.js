var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as mongoose from 'mongoose';
import chalk from 'chalk';
import ora from 'ora';
var StatutsConnection;
(function (StatutsConnection) {
    StatutsConnection["Connected"] = "connected";
    StatutsConnection["In_waiting_connection"] = "wait";
    StatutsConnection["discontinued"] = "discontinued";
    StatutsConnection["Error_connection"] = "error";
})(StatutsConnection || (StatutsConnection = {}));
export class ConnectionUtilityMongoDB {
    constructor(uri) {
        this._status = StatutsConnection.In_waiting_connection;
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
                    console.log(chalk.bgGreen(chalk.black('database successfuly connected')));
                    resolve(this.makeSchema());
                }
                else {
                    rejects('the data base is not connected');
                }
            });
            PromisePending.then((ObjectModel) => {
                this.objectSchema = ObjectModel;
            }).catch((err) => {
                console.log(chalk.bgRed(err));
            });
        });
    }
    makeSchema() {
        return {
            versions: new mongoose.Schema({
                versionName: String,
                date: { type: Date, default: Date.now },
                content: String
            }),
            single: new mongoose.Schema({
                versionName: String,
                fileName: String,
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
    models() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.MakeSchemaPromise();
            const objectModule = {};
            if (this.objectSchema) {
                for (const [key, value] of Object.entries(this.objectSchema)) {
                    objectModule[key] = mongoose.model(key, value);
                }
                return objectModule;
            }
        });
    }
    CreateModel() {
        return __awaiter(this, void 0, void 0, function* () {
            let test = yield this.models();
            return test;
        });
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
        }).catch((status) => {
            spinner.fail(`status:" ${chalk.red(status)} "`);
        }).finally(() => {
            process.exit();
        });
    }
}
const Connection = new ConnectionUtilityMongoDB("mongodb://127.0.0.1:27017/versionningThreeJs");
export function UsableTest(Connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = ora('Waiting for The Return Status').start();
        Connection.testConnnectionAwaited(spinner);
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const test = yield Connection.CreateModel();
    console.log(test);
}))();
//# sourceMappingURL=dbConnection.js.map