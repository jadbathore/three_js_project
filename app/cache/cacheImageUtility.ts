class ImagesCacheHandler{
    static #imagesList:imageInterface[] = []
    static #instance: ImagesCacheHandler;
    
    public static get instance(): ImagesCacheHandler {
        if (!ImagesCacheHandler.#instance) {
            ImagesCacheHandler.#instance = new ImagesCacheHandler();
        }
        return ImagesCacheHandler.#instance;
    }

    public static saveNameToLocalStorage():void{
        for (const image of ImagesCacheHandler.#imagesList) {
            console.log(image.url)
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
}

export {ImageCache,ImagesCacheHandler}

