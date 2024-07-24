const chalk = require('chalk');
const path = require('path');
const fs = require('fs');




const complierFile = path.join(process.cwd(),'versionning','compling.js')

module.exports = class Utility {

    constructor(fileDirArray)
    {
        this.fileDirArray = this.mapContent(fileDirArray)
    }

    mapContent(fileArray){
        
        const mapContent = new Map();
        let ii = 1;
        for(let i = 0;i< fileArray.length;i++)
        {
            const basenameFile = path.basename(fileArray[i])
            switch(basenameFile)
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
        const regexremove = /^((?!const.{.)[\s\S])*$/gm
        const regexfound = /\b(const.{.*)/g
        for(let i = 0;i< fileArray.length;i++)
        {
            let content = fs.readFileSync(fileArray[i],'utf-8');
            if(content.match(regexfound) === null)
            {
                compiledContent += `//file: ${path.basename(fileArray[i])}\n${content}\n`
            } else {
                compiledContent += `//file: ${path.basename(fileArray[i])}\n${content.match(regexremove).join('')}\n`
            }
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
    repopulatelinkFile()
    {
        const pathtolinkFile = path.join(process.cwd(),'versionning','linkFile.js')
        const pathtoCompiler = path.join(process.cwd(),'versionning','compling.js')
        const contentCompiler = fs.readFileSync(pathtoCompiler,'utf-8')

        try {
            fs.access(pathtolinkFile,constants.F_OK,async(err)=>{
                if(err != null)
                {
                    await fs.promises.appendFile(pathtolinkFile,contentCompiler)
                        .then(()=>{console.log(chalk.green('le fichier linkFile à été crée'))})
                        .catch((error)=>{console.log(error)})
                } else {
                    let writer = fs.createWriteStream(pathtolinkFile, { 
                        flags: 'w'
                    }); 
                    fs.truncate(pathtolinkFile,0,(err)=>{ 
                        if (err){ 
                            throw new Error(`erreur truncate ${time} \n${err}`);
                        }})
                    writer.write(this.getContentFile(this.fileDirArray.slice(1)))
                    // writer.write(exportsScript)
                } 
            }) 
        } catch (err) {
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
                    this.getContentFile(this.fileDirArray)
                );
            },)
    }

}