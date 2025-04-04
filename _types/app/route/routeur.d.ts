import e from 'express';
export type AppRouter = Server.route<e.Request<{}, any, any, any, Record<string, any>>, e.Response<any, Record<string, any>>, e.NextFunction>;
export declare const router: AppRouter[];
