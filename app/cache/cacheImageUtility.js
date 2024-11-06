var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    constructor() { }
    static get instance() {
        if (!__classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_instance)) {
            __classPrivateFieldSet(_a, _a, new _a(), "f", _ImagesCacheHandler_instance);
        }
        return __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_instance);
    }
    static saveNameToLocalStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheStorage = yield caches.open('V1');
            for (const image of __classPrivateFieldGet(_a, _a, "f", _ImagesCacheHandler_imagesList)) {
                yield cacheStorage.add(image.url);
                yield image.cacheFetchPromise();
            }
        });
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
        this._instanceList = ImagesCacheHandler.instance;
        this._url = url;
    }
    get url() {
        this._instanceList.addTolist(this);
        return this._url;
    }
    cacheFetchPromise() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheStorage = yield caches.open('V1');
            const cachedResponse = yield cacheStorage.match(this._url);
            if (!cachedResponse || !cachedResponse.ok) {
                return false;
            }
            return yield cachedResponse.json();
        });
    }
}
export { ImageCache, ImagesCacheHandler };
//# sourceMappingURL=cacheImageUtility.js.map