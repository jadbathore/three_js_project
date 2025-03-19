class ImagesCacheHandler{
    static #imagesList:Cache.imageInterface[] = []
    static #instance: ImagesCacheHandler;

    private constructor(){}
    
    public static get instance(): ImagesCacheHandler {
        if (!ImagesCacheHandler.#instance) {
            ImagesCacheHandler.#instance = new ImagesCacheHandler();
        }
        return ImagesCacheHandler.#instance;
    }

    public static saveNameToLocalStorage():void
    {
        for (const image of ImagesCacheHandler.#imagesList) {
            localStorage.getItem(image.url) ?? localStorage.setItem(image.url,image.url)
        }
    }



    public addTolist(imageInterface: Cache.imageInterface): void {
        if(!ImagesCacheHandler.#imagesList.includes(imageInterface))
        {
            ImagesCacheHandler.#imagesList.push(imageInterface)
        }
    }
}


class ImageCache implements Cache.imageInterface {
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
}

export {ImageCache,ImagesCacheHandler}

