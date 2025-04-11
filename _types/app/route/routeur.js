import PathUtility from '../model/CompilerSetUp/Utility/pathUtility.js';
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
        scene: PathUtility.rootDirProjectName,
        method: RequestMethod.get,
        serverLogic: (req, res) => {
            res.render('index', {
                title: 'test_app'
            });
        }
    },
    {
        pathServer: "/hello",
        method: RequestMethod.get,
        serverLogic: (req, res) => {
            res.send("hello Word");
        }
    }
];
