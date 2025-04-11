import e from 'express';
import PathUtility from '../model/CompilerSetUp/Utility/pathUtility.js';

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

export type AppRouter = Server.route<e.Request<{}, any, any, any, Record<string, any>>,e.Response<any, Record<string, any>>,e.NextFunction,RequestMethod>;

export const router:AppRouter[] = [
    {
        pathServer:"/",
        scene:PathUtility.rootDirProjectName,
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.render('index',
            {
                title:'test_app'
            })
        }
    },
    {
        pathServer:"/hello",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.send("hello Word")
        }
    }
];