declare class ImagesCacheHandler {
    #private;
    private constructor();
    static get instance(): ImagesCacheHandler;
    static saveNameToLocalStorage(): void;
    addTolist(imageInterface: Cache.imageInterface): void;
}
declare class ImageCache implements Cache.imageInterface {
    private _url;
    private _instanceList;
    constructor(url: string);
    get url(): string;
}
export { ImageCache, ImagesCacheHandler };
