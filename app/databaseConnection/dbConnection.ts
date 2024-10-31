import { Schema, model,Mongoose } from 'mongoose';
import chalk from 'chalk';
import { Ora,} from 'ora';
import ora from 'ora';

enum StatutsConnection {
    Connected = "connected",
    In_waiting_connection = 'wait',
    discontinued = "discontinued",
    Error_connection="error",
}

interface MangooseTableSchema {
    versions?:Schema;
    single?:Schema;
    usable?:Schema;
}

interface MangooseTableModel {
    [key:string]:any;
}

interface ReadonlyMangooseTableModel {
    readonly [key:string]:any;
}

export class ConnectionUtilityMongoDB {
    private _status: StatutsConnection = StatutsConnection.In_waiting_connection;
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

    public async setStatus():Promise<void>{
        this._status = await this.tryConnection()
    }

    public async MakeSchemaPromise():Promise<void>{
        await this.setStatus()
        const PromisePending:Promise<MangooseTableSchema|string>= new Promise((resolve,rejects)=>{
            if(this._status == StatutsConnection.Connected){
                console.log(chalk.bgGreen(chalk.black('database successfuly connected')))
                resolve(this.makeSchema())
            } else {
                rejects('the data base is not connected')
            }
        })
        PromisePending.then((ObjectModel:MangooseTableSchema)=>{
            this.objectSchema = ObjectModel
        }).catch((err)=>{
            console.log(chalk.bgRed(err))
        })
    }
    
    private makeSchema():MangooseTableSchema{
        return {
            versions: new mongoose.Schema(
                {
                    versionName:String,
                    date:{type:Date,default:Date.now},
                    content:String
                }),
            single: new mongoose.Schema(
                {
                    versionName:String,
                    fileName:String,
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

    private async models():Promise<MangooseTableModel>{
        await this.MakeSchemaPromise()
        const objectModule:MangooseTableModel= {}
        if(this.objectSchema){
            for(const [key,value] of Object.entries(this.objectSchema))
                {
                    objectModule[key] = new mongoose.model(key,value)
                }
            return objectModule
        }
    }

    public async CreateModel():Promise<ReadonlyMangooseTableModel> 
    {
        let test:ReadonlyMangooseTableModel = await this.models()
        return test
    };

    private async testTheConnectionPromise():Promise<string>{
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
        this.testTheConnectionPromise().then((status)=>{
            spinner.succeed(`status:" ${chalk.green(status)} "`)
        }).catch((status)=>{
            spinner.fail(`status:" ${chalk.red(status)} "`)
        }).finally(()=>{
            process.exit()
        })
    }

}

const Connection = new ConnectionUtilityMongoDB("mongodb://127.0.0.1:27017/versionningThreeJs");

export async function UsableTest(Connection:ConnectionUtilityMongoDB){
    const spinner = ora('Waiting for The Return Status').start()
    Connection.testConnnectionAwaited(spinner)
}
(async()=>{
    const test = await Connection.CreateModel()
    console.log(test)
})()



