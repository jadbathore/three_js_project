class ImagesCacheHandler{
    static #imagesList:imageInterface[] = []
    static #instance: ImagesCacheHandler;

    private constructor(){}
    
    public static get instance(): ImagesCacheHandler {
        if (!ImagesCacheHandler.#instance) {
            ImagesCacheHandler.#instance = new ImagesCacheHandler();
        }
        return ImagesCacheHandler.#instance;
    }

    public static async saveNameToLocalStorage():Promise<void>
    {
        const cacheStorage = await caches.open('V1');
        for (const image of ImagesCacheHandler.#imagesList) {
            await cacheStorage.add(image.url);
            await image.cacheFetchPromise();
        }
    }



    public addTolist(imageInterface: imageInterface): void {
        if(!ImagesCacheHandler.#imagesList.includes(imageInterface))
        {
            ImagesCacheHandler.#imagesList.push(imageInterface)
        }
    }
}

interface imageInterface {
    get url(): string;
    cacheFetchPromise():Promise<void|boolean>;
}


class ImageCache implements imageInterface {
    private _url:string
    private _instanceList:ImagesCacheHandler = ImagesCacheHandler.instance

    constructor(
        url:string,
    ){
        this._url = url
    }

    public get url():string{
        this._instanceList.addTolist(this)
        return this._url
    }
    
    public async cacheFetchPromise():Promise<void|boolean>{
        const cacheStorage = await caches.open('V1');
        const cachedResponse = await cacheStorage.match(this._url);
        if (!cachedResponse || !cachedResponse.ok) {
            return false;
        }
        return await cachedResponse.json();
    }
}

export {ImageCache,ImagesCacheHandler}

