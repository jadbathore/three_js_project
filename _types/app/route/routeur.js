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
        pathServer: "/",
        scene: "scene1",
        method: RequestMethod.get,
        serverLogic: (req, res) => {
            res.render('index', {
                title: 'scene 1'
            });
        }
    },
    {
        pathServer: "/hello",
        method: RequestMethod.get,
        serverLogic: (req, res) => {
            res.send("hello Word");
        }
    },
    {
        pathServer: "/mars",
        scene: "scene2",
        method: RequestMethod.get,
        serverLogic: (req, res) => {
            res.render('index', {
                title: 'scene 2'
            });
        }
    },
];
