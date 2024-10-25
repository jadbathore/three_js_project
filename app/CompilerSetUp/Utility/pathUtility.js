import fs from 'fs'
import path from 'path';


export default class PathUtility {

    static{
        this.self = (new PathUtility)
        this.compilerFile = path.join(process.cwd(),'app','public','versionning','compling.js');
        this.linkFile = path.join(process.cwd(),'app','public','versionning','linkfile.js');
        this.rollupConfig = path.resolve(process.cwd(),'rollup.config.js');
        this.rootDirProjectName = './app/threeElement/';
        this.dirPathAssetName = './app/public/asset/';
        this.dirPathPublic = './app/public/';
        this.viewerPathName = path.join(process.cwd(),'app','viewer');
    }

    getPathSplit(pathFile)
    {
        const pathregex =/((\.)|(\/))/g
        const replace = pathFile.replace(pathregex,' ')
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

    static getRollupFile()
    {
        return this.rollupConfig;
    }

    static getMapFile()
    {
        const mapFile = new Map();
        fs.readdirSync(this.rootDirProjectName,{withFileTypes:true}).filter(dir => dir.isDirectory()).map((dir)=>{
            const arry = fs.readdirSync(path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),dir.name))
            mapFile.set(dir.name,arry)
        });
        return mapFile
    }

    static getarrayFile()
    {
        const allFile = []
        for (const [key, value] of PathUtility.getMapFile())     
        {
            for (const file of value)
            {
                const pathFile = path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),key,file)
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
        const basenameFile = []
        PathUtility.getarrayFile().forEach((element)=>{
            const base = path.basename(element)
            basenameFile.push(base)
        })
        return basenameFile
    }

    static getBasenameExceptingSetting() 
    {
        const basenameFile = []
        PathUtility.getArrayFileExeceptSetting().forEach((element)=>{
            const base = path.basename(element)
            basenameFile.push(base)
        })
        return basenameFile
    }
    static getPathFromElement(...pathfile)
    {
        return path.join(process.cwd(),...this.self.getPathSplit(this.rootDirProjectName),...pathfile)
    }

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


