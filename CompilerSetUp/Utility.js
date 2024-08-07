import chalk from 'chalk';
import path from 'path';
import fs from 'fs'



const complierFile = path.join(process.cwd(),'public','versionning','compling.js')

export default class Utility {

    constructor(fileDirArray,mapAsset)
    {
        this.fileDirArray = this.mapContent(fileDirArray)
        this.mapAsset = mapAsset
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
                case'loader.js':mapContent.set(3,fileArray[i]);break;
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
        const getAsset = this.getAssetPathConst()
        for(let i = 0; i<getAsset.length;i++)
        {
            compiledContent+=`const ${getAsset[i]}\n`
        }
        const regexremove = /^((?!const.{.*.}.[=].require)[\s\S])*$/gm
        const regexfound = /\b(const.{.*)/g
        for(let i = 0;i< fileArray.length;i++)
        {
            let content = fs.readFileSync(fileArray[i],'utf-8').trim();
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
                    content += this.getExportScript(this.getAllExportName(this.getContentFile(this.fileDirArray)))
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
    getAllExportName(content)
    {
        const regexgetConst = /(?<=[c][o][n][s][t].)[^{][A-z0-9]*/g; 
        const regexgetfunction = /(?<=[f][u][n][c][t][i][o][n].)[A-z]*/g; 
        const getAllFunction = /(function)+.*[^]*.?\/*[}][^(function)+]/gm;
        const allConstinfile = content.match(regexgetConst)
        const alltheFunction = content.match(getAllFunction)
        let contentfunc = ''
        for(let i = 0; i < alltheFunction.length; i++)
        {
            contentfunc += alltheFunction[i]
        }
        const allconstinFunc = contentfunc.match(regexgetConst)
        const diferrence = allConstinfile.filter((element)=> !allconstinFunc.includes(element))
        const allfuncinfile = content.match(regexgetfunction)
        const allinfile = diferrence.concat(allfuncinfile)
        return allinfile;
    }

    addimportScript(file)
    {
        const forbiden = []
        forbiden.push(path.join(process.cwd(),'threeElement','Setting','configImport.js'))
        forbiden.push(path.join(process.cwd(),'threeElement','Setting','resizeSetting.js'))

        if(!forbiden.includes(file))
        {
            const regexmatchRequire = /(const.{.*.}.[=].require)+.*/g
            const test = fs.readFileSync(file,'utf-8').match(regexmatchRequire)
            if(test === null)
            {
                const text = this.getImportStript()
                fs.appendFile(file,text,(err)=>{ 
                    if (err) 
                    { 
                        throw new Error(`erreur import Script`);
                    }
                })
                return console.log(chalk.green(`the import statement as been added to '${file}' `))
            } else {
                return false 
            }
        }
    }

    getExportScript(constArray)
    {
        let exportsScript = 'exports.THREE = THREE\n'
        for(let i = 0; i < constArray.length; i++)
        {
            exportsScript+=`module.exports = {${constArray[i]}}\n`
        }
        return exportsScript;
    }

    getImportStript(){
        const theConst = this.getAllExportName(this.getContentFile(this.fileDirArray))
        let importScript = '\nconst {'
        for(let i = 0;i< theConst.length;i++)
        {
            importScript += `${theConst[i]},`
        }
        importScript+= `THREE} = require('../../public/versionning/linkFile.js')\n`
        return importScript
    }

    getAssetPathConst()
    {
        const arraycontent = []
        for(const [key, value] of this.mapAsset)
            {
                if(key === 'img')
                {
                    let content = `${key} = {\n`
                    for (const file of value)
                    {
                        if(path.basename(file).includes('.png'))
                            {
                                content+= `${path.basename(file,'.png')}:'${path.join('asset','img',file)}',\n`;
                            } else if(path.basename(file).includes('.jpg')) {
                                content+= `${path.basename(file,'.jpg')}:'${path.join('asset','img',file)}',\n`;
                            }
                    };
                    content+= '}\n'
                    arraycontent.push(content)
                } else if (key === 'gltf'){
                    let content = `${key} = {\n`
                    for(const file of value)
                    {
                        content+= `${path.basename(file,'.gltf')}:'${path.join('asset','gltf',file)}',\n`;
                    }
                    content+= '}\n'
                    arraycontent.push(content)
                }
            }
            return arraycontent

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