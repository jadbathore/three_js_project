import e from 'express';
import PathUtility from '../model/CompilerSetUp/Utility/pathUtility.js';
import { Compiler } from '../model/CompilerSetUp/Compiler.js';

export enum RequestMethod {
    get = "get",
    post = 'post',
    put = "put",
    delete="delete",
    patch="patch",
    head="head",
    options="options",
    trace="trace",
    connect="connect",
    middleWare="use",
}

export type AppRouter = Server.route<e.Request<{}, any, any, any, Record<string, any>>,e.Response<any, Record<string, any>>,e.NextFunction,RequestMethod,Compiler>;

export const router:AppRouter[] = [
    {
        pathServer:"/",
        scene:"scene1",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.render('index',
            {
                title:'scene 1'
            })
        }
    },
    {
        pathServer:"/hello",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.send("hello Word")
        }
    },
    {
        pathServer:"/mars",
        scene:"scene2",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.render('index',
            {
                title:'scene 2'
            })
        }
    },
    {
        pathServer:"/w",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.render('test',
            {
                title:'test wasm'
            })
        }
    },
    
];