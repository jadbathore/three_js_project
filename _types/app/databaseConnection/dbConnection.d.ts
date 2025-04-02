import mongoose from 'mongoose';
import { Ora } from 'ora';
declare enum StatutsConnection {
    Connected = "connected",
    In_waiting_connection = "wait",
    discontinued = "discontinued",
    Error_connection = "error"
}
interface versionInterface {
    versionName: string;
    name: string;
    date: {
        type: DateConstructor;
        default: () => number;
    };
    content: string;
}
interface singleInterface {
    versionName: string;
    name: string;
    date: {
        type: DateConstructor;
        default: () => number;
    };
    content: string;
}
interface usableInterface {
    UsableName: String;
    name: String;
    date: {
        type: DateConstructor;
        default: () => number;
    };
    content: Object;
}
interface MangooseTableSchema {
    versions?: mongoose.Schema<versionInterface>;
    single?: mongoose.Schema<singleInterface>;
    usable?: mongoose.Schema<usableInterface>;
}
interface ReadonlyMangooseTableModel {
    readonly [key: string]: mongoose.Model<any, unknown, unknown, unknown, any, any>;
}
declare class ClassObjectMongooseModel {
    private static _instance;
    private _object?;
    private constructor();
    static get instance(): ClassObjectMongooseModel;
    setObject(object: ReadonlyMangooseTableModel): void;
    get object(): ReadonlyMangooseTableModel | null;
}
export declare class ConnectionUtilityMongoDB {
    private _status;
    instanceMongooseModel: ClassObjectMongooseModel;
    private _uri;
    objectSchema?: MangooseTableSchema;
    constructor(uri: string);
    get status(): StatutsConnection;
    private tryConnection;
    private setStatus;
    MakeSchemaPromise(): Promise<string | MangooseTableSchema>;
    private makeSchema;
    private createModelPromise;
    private resulthandler;
    findObject(tableName: string, query?: Object): Promise<void | any[]>;
    findLastObject(tableName: string): Promise<void | any[]>;
    UpdateObject(tableName: string, query: Object, update: Object): Promise<void>;
    saveObject(tableName: string): Promise<void | mongoose.Model<any, unknown, unknown, unknown, any, any>>;
    DeleteObject(tableName: string, query: Object): Promise<void>;
    testTheConnectionPromise(): Promise<string>;
    testConnnectionAwaited(spinner: Ora): Awaited<void>;
}
export {};
