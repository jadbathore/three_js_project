export var RequestMethod;
(function (RequestMethod) {
    RequestMethod["get"] = "get";
    RequestMethod["post"] = "post";
    RequestMethod["put"] = "put";
    RequestMethod["delete"] = "delete";
    RequestMethod["patch"] = "patch";
    RequestMethod["head"] = "head";
    RequestMethod["options"] = "options";
    RequestMethod["trace"] = "trace";
    RequestMethod["connect"] = "connect";
    RequestMethod["middleWare"] = "use";
})(RequestMethod || (RequestMethod = {}));
export const router = [
    {
        method: RequestMethod.middleWare,
        serverLogic: (req, res, next) => {
            next();
        }
    },
    {
        pathServer: "/",
        scene: "threeElement",
        method: RequestMethod.get,
        serverLogic: (req, res) => {
            res.send('bonjour');
        }
    }
];
