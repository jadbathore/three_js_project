import chalk from 'chalk';
import path from 'path';
import fs from 'fs';




const complierFile = path.join(process.cwd(),'public','versionning','compling.js')

export default class Utility {

    constructor(fileDirArray,assetDirArray)
    {
        this.fileDirArray = this.mapContent(fileDirArray)
        this.assetDirArray = assetDirArray
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
                
                case'animate.js': mapContent.set(fileArray.length - 2,fileArray[i]);break;
                case'resizeSetting.js':mapContent.set(fileArray.length - 1,fileArray[i]);break;
                default: mapContent.set(2+ii,fileArray[i]);
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
        let compiledContent = `const ${this.getAssetPathConst()}`;
        const regexremove = /^((?!const.{.*.}.[=].require)[\s\S])*$/gm
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
            let time = new Date(Date.now()).toString();
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

    async repopulatelinkFile()
    {
        let time = new Date(Date.now()).toString()

        const linkFile = path.join(process.cwd(),'public','versionning','linkFile.js')
            await this.complilerContentPromise()
            .then(()=>{
                setTimeout(()=>{
                    fs.truncate(linkFile, 0,(err)=>{ 
                        if (err){ 
                            throw new Error(`erreur truncate ${time} \n${err}`);
                        }}
                    );
                    const compileContent = this.getContentFile(this.fileDirArray.slice(1))
                    let content = "const THREE = require('three')\n"
                    content += compileContent
                    content += this.getExportScript(this.getContentFile(this.fileDirArray.slice(1)))
                    fs.appendFile(linkFile,content,(err)=>{ 
                        if (err){ 
                            throw new Error(`erreur compilation linkfile ${time} \n${err}`);
                        }
                        console.log(chalk.green(`fichier link mise à jour ${time}`))
                    })
                },500)
            }).catch((err)=>{
                console.log(`${err}\n${new Date(Date.now()).toString()}`)
            })
    }

    getExportScript(content)
    {
        const regexgetConst = /(?<=[c][o][n][s][t].)[^{][A-z]*/g; 
        const regexgetfunction = /(?<=[f][u][n][c][t][i][o][n].)[A-z]*/g; 
        const allConstinfile = content.match(regexgetConst)
        const allfuncinfile = content.match(regexgetfunction)
        const allinfile = allConstinfile.concat(allfuncinfile)
        let exportsScript = 'exports.THREE = THREE\n'
        for(let i = 0; i < allinfile.length; i++)
        {
            exportsScript+=`module.exports = {${allinfile[i]}}\n`
        }
        exportsScript+= `module.exports.${this.getAssetPathConst()}`
        return exportsScript;
    }

    getAssetPathConst()
    {
        let content = 'img = {\n'
        for(let i = 0; i<this.assetDirArray.length;i++)
        {
            if(path.basename(this.assetDirArray[i]).includes('.png'))
            {
                content+= `${path.basename(this.assetDirArray[i],'.png')}:'${path.join('asset',this.assetDirArray[i])}',\n`;
            } else if(path.basename(this.assetDirArray[i]).includes('.jpg')) {
                content+= `${path.basename(this.assetDirArray[i],'.jpg')}:'${path.join('asset',this.assetDirArray[i])}',\n`;
            }

        }
        content+= '}\n'
        return content
    }

    complilerContentPromise() 
    {
        return new Promise((resolve,reject)=>
            {
                setTimeout(()=>{
                    reject("la compilation des donnée à pris trop de temps");
                },3000)
                resolve(
                    this.getContentFile(this.fileDirArray)
                );
                
            },)
    }
}