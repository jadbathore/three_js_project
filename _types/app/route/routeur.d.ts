import e from 'express';
export declare enum RequestMethod {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete",
    patch = "patch",
    head = "head",
    options = "options",
    trace = "trace",
    connect = "connect",
    middleWare = "use"
}
export type AppRouter = Server.route<e.Request<{}, any, any, any, Record<string, any>>, e.Response<any, Record<string, any>>, e.NextFunction, RequestMethod>;
export declare const router: AppRouter[];
