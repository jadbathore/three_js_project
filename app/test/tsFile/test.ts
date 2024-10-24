import chalk from "chalk";


export class ImagesCacheHandler{
    static #imagesList:imageInterface[] = []
    static #instance: ImagesCacheHandler;
    
    public static get instance(): ImagesCacheHandler {
        if (!ImagesCacheHandler.#instance) {
            ImagesCacheHandler.#instance = new ImagesCacheHandler();
        }

        return ImagesCacheHandler.#instance;
    }

    public addTolist(imageInterface: imageInterface): void {
        if(!ImagesCacheHandler.#imagesList.includes(imageInterface))
        {
            ImagesCacheHandler.#imagesList.push(imageInterface)
        }
    }
    
    public static saveNameToLocalStorage(){
        for (const image of ImagesCacheHandler.#imagesList) {
            console.log(chalk.green(image.url))
        }
    }
}

interface imageInterface {
    get url(): string;
}


export class ImageCache implements imageInterface {
    private _url:string
    private instanceList:ImagesCacheHandler = ImagesCacheHandler.instance

    constructor(
        url:string,
    ){
        this._url = url
    }

    public get url():string{
        this.instanceList.addTolist(this)
        return this._url
    }
}

function randomfunction(a:string){
console.log('test'+a)
}

const a = {
    a:new ImageCache('test/a'),
    b:new ImageCache('test/b'),
    c:new ImageCache('test/c'),
    d:new ImageCache('test/d'), 
}

a.a.url
a.b.url

randomfunction(a.c.url)
const name = {
    map: a.d.url
}

ImagesCacheHandler.saveNameToLocalStorage()