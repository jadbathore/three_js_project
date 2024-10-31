var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _ImagesCacheHandler_imagesList, _ImagesCacheHandler_instance;
import chalk from "chalk";
export class ImagesCacheHandler {
    static get instance() {
        if (!__classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_instance)) {
            __classPrivateFieldSet(_a, _a, new _a(), "f", _ImagesCacheHandler_instance);
        }
        return __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_instance);
    }
    addTolist(imageInterface) {
        if (!__classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList).includes(imageInterface)) {
            __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList).push(imageInterface);
        }
    }
    static saveNameToLocalStorage() {
        for (const image of __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList)) {
            console.log(chalk.green(image.url));
        }
    }
}
_a = ImagesCacheHandler;
_ImagesCacheHandler_imagesList = { value: [] };
_ImagesCacheHandler_instance = { value: void 0 };
export class ImageCache {
    constructor(url) {
        this.instanceList = ImagesCacheHandler.instance;
        this._url = url;
    }
    get url() {
        this.instanceList.addTolist(this);
        return this._url;
    }
}
function randomfunction(a) {
    console.log('test' + a);
}
const a = {
    a: new ImageCache('test/a'),
    b: new ImageCache('test/b'),
    c: new ImageCache('test/c'),
    d: new ImageCache('test/d'),
};
a.a.url;
a.b.url;
randomfunction(a.c.url);
const name = {
    map: a.d.url
};
ImagesCacheHandler.saveNameToLocalStorage();
//# sourceMappingURL=test.js.map