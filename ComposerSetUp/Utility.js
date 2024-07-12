const chalk = require('chalk');
const path = require('path');
const fs = require('fs');




const complierFile = path.join(process.cwd(),'versionning','compling.js')

module.exports = class Utility {

    constructor(fileArray,map)
    {
        this.fileArray = this.mapContent(fileArray)
        this.map = map
    }

    mapContent(fileArray) {
        const mapContent = new Map();
        let ii = 1;
        for(let i = 0;i< fileArray.length;i++)
        {
            switch(fileArray[i])
            {
                case'configImport.js': mapContent.set(0,fileArray[i]);break;
                case'RendererSetting.js':mapContent.set(1,fileArray[i]);break;
                case'cameraSetting.js': mapContent.set(2,fileArray[i]);break;
                case'light.js': mapContent.set(3,fileArray[i]);break;
                case'animate.js': mapContent.set(fileArray.length - 2,fileArray[i]);break;
                case'resizeSetting.js':mapContent.set(fileArray.length - 1,fileArray[i]);break;
                default: mapContent.set(3+ii,fileArray[i]);
                ii++;
                break;
            }
        }
        const array = []
        for(let i = 0;i< fileArray.length;i++)
        {
            const mapGet =  mapContent.get(i) 
            array.push(mapGet);
        }
        return array;
        }
    

    getContentFile(fileArray)
    {
        let compiledContent = '';
        for(let i = 0;i< fileArray.length;i++)
        {
            let pathfile = path.join(process.cwd(),'threeElement','..',fileArray[i])
            let content = fs.readFileSync(pathfile,'utf-8');
            compiledContent += `//file: ${fileArray[i]}\n${content}\n`
        }
        return compiledContent;
    }
    

    async repopulateComposer()
    {
        try {
            let time = new Date(Date.now()).toString()
            fs.truncate(complierFile, 0,(err)=>{ 
                if (err){ 
                    throw new Error(`erreur truncate ${time} \n${err}`);
                }}
            );
            await this.complilerContentPromise().then((data)=>{
                fs.appendFile(complierFile,data,(error)=>{
                    if(error)
                        {
                            throw new Error(error)

                        };
                        console.log(chalk.green(`fichier compiler mise à jour ${time}`))
                });
            },(err)=>{
                console.log(chalk.red(`erreur compilation ${time} \n${err}`))
            }
            )
        } catch(err){
            console.log(`${err}\n${new Date(Date.now()).toString()}`)
        }   
    }

    complilerContentPromise() 
    {
        return new Promise((resolve,reject)=>
            {
                setTimeout(()=>{
                    reject("la complation des donnée à pris trop de temps");
                },3000)
                resolve(
                    this.getContentFile(this.fileArray)
                );
            },)
    }
    InArray(needle,haystack){
        for(let i = 0;i<haystack.length;i++)
        {
            if(haystack[i]==needle)
            {
                return true;
            }
        }
        return false;
    }

}