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
            res.render('bonjour');
        }
    }
];
