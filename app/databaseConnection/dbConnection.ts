import mongoose from 'mongoose';
import chalk from 'chalk';
import ora, { Ora } from 'ora';


enum StatutsConnection {
    Connected = "connected",
    In_waiting_connection = 'wait',
    discontinued = "discontinued",
    Error_connection="error",
}

interface versionInterface{
    versionName:string,
    name:string,
    date:{ type: DateConstructor; default: () => number; },
    content:string
}

interface singleInterface{
    versionName:string,
    name:string,
    date:{ type: DateConstructor; default: () => number; },
    content:string
}

interface usableInterface{
    UsableName:String,
    name:String,
    date:{ type: DateConstructor; default: () => number; },
    content: Object
}

interface MangooseTableSchema {
    versions?:mongoose.Schema<versionInterface>;
    single?:mongoose.Schema<singleInterface>;
    usable?:mongoose.Schema<usableInterface>;
}

interface MangooseTableModel {
    [key:string]:mongoose.Model<any, unknown, unknown, unknown, any, any>;
}

interface ReadonlyMangooseTableModel {
    readonly [key:string]:mongoose.Model<any, unknown, unknown, unknown, any, any>;
}

class ClassObjectMongooseModel {
    private static _instance: ClassObjectMongooseModel;
    private _object?:ReadonlyMangooseTableModel;

    private constructor(){}
    
    public static get instance(): ClassObjectMongooseModel {
        if (!ClassObjectMongooseModel._instance) {
            ClassObjectMongooseModel._instance = new ClassObjectMongooseModel();
        }
        return ClassObjectMongooseModel._instance;
    }

    public setObject(object:ReadonlyMangooseTableModel){
        if(!this._object)
        {
            this._object = object
        }
    }

    public get object():ReadonlyMangooseTableModel|null{
        return this._object
    }
}

export class ConnectionUtilityMongoDB {
    private _status: StatutsConnection= StatutsConnection.In_waiting_connection;
    public instanceMongooseModel:ClassObjectMongooseModel= ClassObjectMongooseModel.instance
    private _uri: string;
    public objectSchema?: MangooseTableSchema;

    constructor(
        uri:string
    ){
        this._uri = uri
    }

    public get status():StatutsConnection{
        return this._status
    }

    private tryConnection(){
        let status:StatutsConnection;
        const promisePendingStatus:Promise<StatutsConnection> = new Promise((resolve)=>{
            setTimeout(()=>{
                status = StatutsConnection.discontinued
                resolve(status)
            },3000)
            mongoose.connect(this._uri).then(()=>{
                    status = StatutsConnection.Connected
                }).catch(()=>{
                    status = StatutsConnection.Error_connection;
                }).finally(()=>{
                    resolve(status)
                })
        })
        return promisePendingStatus
    }

    private async setStatus():Promise<void>{
        this._status = await this.tryConnection()
    }

    public async MakeSchemaPromise():Promise<string|MangooseTableSchema>{
        await this.setStatus()
        const PromisePending:Promise<MangooseTableSchema|string>= new Promise((resolve,rejects)=>{
            if(this._status == StatutsConnection.Connected){
                const schemas:MangooseTableSchema = this.makeSchema()
                resolve(schemas)
            } else {
                rejects('the data base is not connected')
            }
        })
        return PromisePending;
    }
    
    private makeSchema():MangooseTableSchema{
        return {
            versions: new mongoose.Schema(
                {
                    versionName:String,
                    name:String,
                    date:{type:Date,default:Date.now},
                    content:String
                }),
            single: new mongoose.Schema(
                {
                    versionName:String,
                    name:String,
                    date:{type:Date,default:Date.now},
                    content:String
                }),
            usable: new mongoose.Schema(
                {
                    UsableName:String,
                    name:String,
                    date:{type:Date,default:Date.now},
                    content: {}
                })
        }
    }

    private createModelPromise():Promise<string|ReadonlyMangooseTableModel>
    {
        const objectModule:MangooseTableModel= {}
        const promisePendingModel:Promise<string|ReadonlyMangooseTableModel>= new Promise((resolve,reject)=>{
            
                this.MakeSchemaPromise().then((objectSchema:MangooseTableSchema)=>{
                    if(!this.instanceMongooseModel.object)
                    {
                        for(const [key,value] of Object.entries(objectSchema))
                        {
                            objectModule[key] = mongoose.model(key,value)
                        }
                        const ReadOnlyModel:ReadonlyMangooseTableModel = objectModule
                        this.instanceMongooseModel.setObject(ReadOnlyModel)
                    }
                    resolve(this.instanceMongooseModel.object)
                }).catch((err:string)=>{
                    console.log(chalk.bgRed(err))
                    reject("no schema were found...")
                })
        })
        return promisePendingModel;
    }

    private resulthandler(result:any[]):null|any[]
    {
        return(result.length == 0)? null : result;
    }

    public findObject(tableName:string,query?:Object):Promise<void | any[]>
    {
        const promise = this.createModelPromise().then(async(Object:ReadonlyMangooseTableModel)=>{
            const TableModel = Object[tableName]
            let result = (typeof query !== 'undefined')? await TableModel.find().where(query) : await TableModel.find();
            return this.resulthandler(result);
        }).catch((err:string)=>{
            console.log(err)
        })
        return promise
    };
    public findLastObject(tableName:string):Promise<void | any[]>
    {
        const promise = this.createModelPromise().then(async(Object:ReadonlyMangooseTableModel)=>{
            const TableModel = Object[tableName]
            let result = await TableModel.find().sort({_id: -1}).limit(1);
            return this.resulthandler(result);
        }).catch((err:string)=>{
            console.log(err)
        })
        return promise
    };

    public UpdateObject(tableName:string,query:Object,update:Object):Promise<void>
    {
        const promise = this.createModelPromise().then(async(Object:ReadonlyMangooseTableModel)=>{
            const TableModel = Object[tableName]
            await TableModel.findOneAndUpdate(query,update)
        }).catch((err:string)=>{
            console.log(err)
        })
        return promise 
    };

    public saveObject(tableName:string):Promise<void | mongoose.Model<any, unknown, unknown, unknown, any, any>>
    {
        const promise = this.createModelPromise().then(async(Object:ReadonlyMangooseTableModel)=>{
            const TableModel = Object[tableName]
            return TableModel
        }).catch((err:string)=>{
            console.log(err)
        })
        return promise
    };

    public DeleteObject(tableName:string,query:Object):Promise<void>
    {
        const promise = this.createModelPromise().then(async(Object:ReadonlyMangooseTableModel)=>{
            const TableModel = Object[tableName]
            await TableModel.findOneAndDelete(query)
        }).catch((err:string)=>{
            console.log(err)
        })
        return promise
    };

    public async testTheConnectionPromise():Promise<string>{
        await this.setStatus();
        const PromisePending:Promise<string>= new Promise((resolve,rejects)=>{
            if(this._status == StatutsConnection.Connected){
                resolve(this._status)
            } else {
                rejects(this._status)
            }
        })
        return PromisePending;
        }

    public testConnnectionAwaited(spinner:Ora):Awaited<void>{
        let statusConnection:StatutsConnection;
        this.testTheConnectionPromise().then((status:StatutsConnection)=>{
            statusConnection = status
            spinner.succeed(`status:" ${chalk.green(status)} "`)
            console.log(chalk.green('\nThe status mean that the connection is good and ready to roll'))
        }).catch((status:StatutsConnection)=>{
            spinner.fail(`status:" ${chalk.red(status)} "`)
            statusConnection = status
            switch(status){
                case StatutsConnection.discontinued:
                    console.log(chalk.red('\nThis status mean that the connection was aborted because the connection time is too long', 
                        '\ncheck if your mongoDB service is running.'))
                    break;
                case StatutsConnection.Error_connection:
                    console.log(chalk.red('\nThis status mean that the connection has a error', 
                        'please check the uri you provide :',
                    ),chalk.yellow(this._uri))
                    break;
                default: console.log(chalk.bgRed('\ninternal error please refer your issue to', 
                    'https://github.com/jadbathore/three_js_project/issues'))
            }
        }).finally(()=>{
            process.exit()
        })
    }
}