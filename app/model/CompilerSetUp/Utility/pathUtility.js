import fs from 'fs'
import path from 'path';
import ThreeTreeConfig from '../../../../threeTree.config.js'


export default class PathUtility {

    static {
        this.self = (new PathUtility)
        this.versionDIR = path.join(process.cwd(),'app','public','versionning');
        this.compilerFile = path.join(process.cwd(),'app','public','versionning','compling.js');
        this.linkFile = path.join(process.cwd(),'app','public','versionning','linkfile.cjs');
        this.rollupConfig = path.resolve(process.cwd(),'rollup.config.js');
        this.dist = path.resolve(process.cwd(),'app','public','dist','compling.js');
        this.rootDirProjectName = ThreeTreeConfig.path.rootDirProjectName;
        this.dirPathAssetName = ThreeTreeConfig.path.dirPathAssetName;
        this.dirPathPublic = ThreeTreeConfig.path.dirPathPublic;
        this.viewerPathName = path.join(process.cwd(),'app','public','wasm_mod','viewer');
        this.keySLL = path.join(process.cwd(),'SSLcredential','key.pem');
        this.certSLL = path.join(process.cwd(),'SSLcredential','cert.pem');
        this.wasmFile = path.join(process.cwd(),'app','public','wasm_mod','pkg','wasm_mod.js')
    }

    /**
     * @type {string|null}
     */
    static #element;

    /**
     * 
     * @param {*} pathFile 
     * @returns 
     */
    getPathSplit(pathFile)
    {
        const pathregex =/((\.)|(\/))/g
        const replace = pathFile.replace(pathregex,' ')
        //@ts-ignore
        return replace?.split(' ')?.filter((e)=>e!='') ?? pathFile;
    }

    static getcompilerFile()
    {
        return this.compilerFile;
    }

    static getViewerFile()
    {
        return this.viewerPathName;
    }

    static getlinkFile()
    {
        return this.linkFile;
    }


    /**
     * 
     * @param {string} [element] 
     */
    static initElement(element){
        this.#element = element
    }
    

    /**
     * 
     * @param {string} [directory] 
     * @returns 
     */
    static getMapFile(directory)
    {
        directory = (directory)? this.rootDirProjectName+directory + "/" : this.rootDirProjectName ;
        const mapFile = new Map(); 
        fs.readdirSync(directory,{withFileTypes:true}).filter(dir => dir.isDirectory()).map((dir)=>{
            const arry = fs.readdirSync(path.join(process.cwd(),...this.self.getPathSplit(directory),dir.name))
            mapFile.set(dir.name,arry)
        });
        return mapFile
    }

    /**
     * 
     * @param {string} [directory] 
     * @returns {string[]}
     */
    static getarrayFile(directory)
    {

        const allFile = []
        for (const [key, value] of PathUtility.getMapFile(directory))     
        {
            for (const file of value)
            {
                const pathFile = path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),directory ?? '',key,file)
                allFile.push(pathFile);
            }
        }   
        return allFile;
    }
    
    static getArrayFileExeceptSetting()
    {
        const allExeceptSetting = []
        for (const [key, value] of PathUtility.getMapFile())     
        {
            for (const file of value)
            {
                if(key != 'Setting')
                {
                    const pathFile = path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),key,file)
                    allExeceptSetting.push(pathFile)
                }
            }
        }   
        return allExeceptSetting;
    }

    static getBasename() 
    {
        /**
         * @type string[]
         */
        const basenameFile = []
        PathUtility.getarrayFile().forEach((element)=>{
            const base = path.basename(element)
            basenameFile.push(base)
        })
        return basenameFile
    }

    static getBasenameExceptingSetting() 
    {
        /**
         * @type string[]
         */
        const basenameFile = []
        PathUtility.getArrayFileExeceptSetting().forEach((element)=>{
            const base = path.basename(element)
            basenameFile.push(base)
        })
        return basenameFile
    }
    /**
     * @param  {...any} [pathfile] 
     * @returns 
     */
    static getPathFromElement(...pathfile)
    {
        return path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),...pathfile);
    }

    /**
     * @param  {...any} [pathfile] 
     * @returns 
     */
    static getPathFromElementCompile(...pathfile)
    {
        return path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),this.#element ?? '',...pathfile);
    }

     /**
     * @param  {string} [pathfile] 
     * @returns 
     */
    static pathofElementWithPoint(pathfile)
    {
    return (pathfile)?this.rootDirProjectName + pathfile :'';
    }

    /**
     * @param  {...any} pathfile 
     * @returns 
     */
    static getPathFromProcess(...pathfile)
    {
        return path.join(process.cwd(),...pathfile)
    }

     /**
     * @param  {...any} pathfile 
     * @returns 
     */
    static getPathFromBaseFile(...pathfile)
    {
        return path.join(process.cwd(),...pathfile)
    }

    /**
     * @param  {...any} pathfile 
     * @returns 
     */
    static getPathFromPublic(...pathfile)
    {
        return path.join(process.cwd(),...this.self.getPathSplit(this.dirPathPublic),...pathfile)
    }
    
    static getMapAsset()
    {
        const mapAsset = new Map();
        fs.readdirSync(this.dirPathAssetName,{withFileTypes:true}).filter(dir => dir.isDirectory()).map((dir)=>{
            const arry = fs.readdirSync(path.join(process.cwd(),...this.self.getPathSplit(this.dirPathAssetName),dir.name))
            mapAsset.set(dir.name,arry)
        });
        return mapAsset
    }
}


