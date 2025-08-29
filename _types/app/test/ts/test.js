import { RequestParser } from "../../model/server/headParser.js";
import { TCPServerSingleTone } from "../../server/client.js";
const instance = TCPServerSingleTone.getInstance(3000);
instance.setData((parser, client) => {
    switch (parser.code) {
        case 101:
            console.log(parser.message);
            console.log(parser.code);
            const requestArgs = {
                path: '/',
                host: 'localhost',
                method: 'GET',
                protocole: parser.protocole,
                headers: {
                    Cookies: 'test=1234;'
                }
            };
            const requestParse = new RequestParser(requestArgs);
            client.write(requestParse.request);
            break;
        case 300:
            break;
    }
});
