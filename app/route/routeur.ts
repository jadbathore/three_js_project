import e from 'express';

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

export type route = {
    pathServer?:string;
    method:RequestMethod;
    scene?:string;
    serverLogic:(
        req: e.Request<{}, any, any, any, Record<string, any>>,
        res: e.Response<any, Record<string, any>>, 
        next?: e.NextFunction
    )=> void;
}

export const router:route[] = [
    {
        method: RequestMethod.middleWare,
        serverLogic:(req,res,next)=>{
            next();
        }
    },
    {
        pathServer:"/",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.send('bonjour')
        }
    }
];