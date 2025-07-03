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
            }, 1000);
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
    async setStatus() {
        this._status = await this.tryConnection();
    }
    async MakeSchemaPromise() {
        if (this._status == StatutsConnection.In_waiting_connection)
            await this.setStatus();
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
    }
    makeSchema() {
        return {
            versions: new mongoose.Schema({
                versionName: String,
                name: String,
                typefile: {
                    validate: {
                        validator: (value) => {
                            return /(javascript)/g.test(value);
                        },
                        message: (props) => `file type not valid`,
                    }
                },
                date: { type: Date, default: Date.now },
                content: {
                    type: String,
                    required: true,
                    validate: {
                        validator: (value) => {
                            return !/((import)|(require))/g.test(value);
                        },
                        message: (props) => `forbiden keyword`,
                    }
                }
            }),
            single: new mongoose.Schema({
                versionName: String,
                name: String,
                date: { type: Date, default: Date.now },
                typefiles: {
                    type: String,
                    required: true,
                    validate: {
                        validator: (value) => {
                            return /(javascript)/g.test(value);
                        },
                        message: (props) => `type must be javascript`,
                    }
                },
                content: {
                    type: String,
                    required: true,
                    validate: {
                        validator: (value) => {
                            return !/((import)|(require))/g.test(value);
                        },
                        message: (props) => `forbiden keyword`,
                    }
                }
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
        const promise = this.createModelPromise().then(async (Object) => {
            const TableModel = Object[tableName];
            let result = (typeof query !== 'undefined') ? await TableModel.find().where(query) : await TableModel.find();
            return this.resulthandler(result);
        }).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    findLastObject(tableName) {
        const promise = this.createModelPromise().then(async (Object) => {
            const TableModel = Object[tableName];
            let result = await TableModel.find().sort({ _id: -1 }).limit(1);
            return this.resulthandler(result);
        }).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    UpdateObject(tableName, query, update) {
        const promise = this.createModelPromise().then(async (Object) => {
            const TableModel = Object[tableName];
            await TableModel.findOneAndUpdate(query, update);
        }).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    saveObject(tableName) {
        const promise = this.createModelPromise().then(async (Object) => {
            const TableModel = Object[tableName];
            return TableModel;
        }).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    DeleteObject(tableName, query) {
        const promise = this.createModelPromise().then(async (Object) => {
            const TableModel = Object[tableName];
            await TableModel.findOneAndDelete(query);
        }).catch((err) => {
            console.log(err);
        });
        return promise;
    }
    ;
    async testTheConnectionPromise() {
        if (this.status == StatutsConnection.In_waiting_connection)
            await this.setStatus();
        const PromisePending = new Promise((resolve, rejects) => {
            if (this._status == StatutsConnection.Connected) {
                resolve(this._status);
            }
            else {
                rejects(this._status);
            }
        });
        return PromisePending;
    }
    testConnnectionAwaited(spinner) {
        let statusConnection;
        this.testTheConnectionPromise().then((status) => {
            statusConnection = status;
            spinner.succeed(`status:" ${chalk.green(status)} "`);
            console.log(chalk.green('\nThe status mean that the connection is good and ready to roll'));
        }).catch((status) => {
            spinner.fail(`status:" ${chalk.red(status)} "`);
            statusConnection = status;
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
