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
class ImagesCacheHandler {
    static get instance() {
        if (!__classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_instance)) {
            __classPrivateFieldSet(_a, _a, new _a(), "f", _ImagesCacheHandler_instance);
        }
        return __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_instance);
    }
    static saveNameToLocalStorage() {
        for (const image of __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList)) {
            console.log(image.url);
        }
    }
    addTolist(imageInterface) {
        if (!__classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList).includes(imageInterface)) {
            __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList).push(imageInterface);
        }
    }
}
_a = ImagesCacheHandler;
_ImagesCacheHandler_imagesList = { value: [] };
_ImagesCacheHandler_instance = { value: void 0 };
class ImageCache {
    constructor(url) {
        this.instanceList = ImagesCacheHandler.instance;
        this._url = url;
    }
    get url() {
        this.instanceList.addTolist(this);
        return this._url;
    }
}
export { ImageCache, ImagesCacheHandler };
//# sourceMappingURL=cacheImageUtility.js.map