import e from 'express';


export type AppRouter = Server.route<e.Request<{}, any, any, any, Record<string, any>>,e.Response<any, Record<string, any>>,e.NextFunction>;

export const router:AppRouter[] = [
    {
        method: RequestMethod.middleWare,
        serverLogic:(req,res,next)=>{
            next();
        }
    },
    {
        pathServer:"/",
        scene:"threeElement",
        method: RequestMethod.get,
        serverLogic:(req,res)=>{
            res.render('bonjour')
        }
    }
];