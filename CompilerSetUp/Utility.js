import chalk from 'chalk';
import path from 'path';
import fs from 'fs'
import mongoose from 'mongoose';
import boxen from 'boxen';


const complierFile = path.join(process.cwd(),'public','versionning','compling.js')

export default class Utility {

    constructor(fileDirArray,mapAsset)
    {
        this.fileDirArray = this.mapContent(fileDirArray)
        this.mapAsset = mapAsset
    }

    mapContent(fileArray)
    {
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
                case undefined: break;
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

    replaceContent(text,wordConst=null,VariableRaw=null)
    {
            const originalhash = new mongoose.Types.ObjectId().toString()
            
            if(wordConst != null)
            {
                for(let i=0;i<wordConst.length;i++)
                    {
                        
                        // text.replaceAll(wordConst[i],`${wordConst[i]}_${originalhash}`)
                        text = text.split(wordConst[i]).join(`${wordConst[i]}_${originalhash}`);
                        // console.log(text)
                    }
            }
            if(VariableRaw != null)
            {
                for(let i=0;i<VariableRaw.length;i++)
                    {
                        text = text.split(VariableRaw[i]).join(VariableRaw[i].slice(4));
                    }
            }
            return text
    }

    checkdouble(array)
    {
        const setformarray = new Set(array)
        if (array.length !== setformarray.size)
        {
            const toCompensed = array.length - setformarray.size
            return toCompensed;
        } else {
            return false;
        }
    }
    

    getContentFile(fileArray,options=null )
    {
        let compiledContent = '';
        const getAsset = this.getAssetPathConst()
        for(let i = 0; i<getAsset.length;i++)
        {
            compiledContent+=`const ${getAsset[i]}\n`
        }
        const regexremove = /^((?!const.{.*.}.[=].require)[\s\S])*$/gm
        const regexfound = /\b(const.{.*)/g
        if(options == null)
        {
            const matchregexRaw = /(let)+[^{][A-z]*.*/g;
            const matchregexWord = /(?<=let.)[^{][A-z]*/g;
            const matchregexConstRaw = /(const.) [^{][A-z]*/g;
            const matchregexConstWord = /(?<=const.)[^{][A-z]*/g;

            let totalDeclaration = [];
            for(let i = 0;i<fileArray.length;i++)
            {
                if(fileArray[i] !== undefined)
                {
                    let content = fs.readFileSync(fileArray[i],'utf-8')
                    const allVariableRaw = content.match(matchregexRaw)
                    // const allVariableRawConst = content.match(matchregexConstRaw)
                    const allVariableword = content.match(matchregexWord);
                    const allVariablewordConst = content.match(matchregexConstWord);
                    if(allVariableword !== null)
                    {
                        totalDeclaration = totalDeclaration.concat(allVariableword)
                    } 
                    if(allVariablewordConst !== null)
                    {
                        totalDeclaration = totalDeclaration.concat(allVariablewordConst)
                    }
                    if(content !== null)
                    {
                        if(this.checkdouble(totalDeclaration) == false)
                        {
                            if(content.match(regexfound) === null)
                                {
                                    compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${content.trim()}\n`
                                } else {
                                    compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${content.match(regexremove).join('').trim()}\n`
                                }
                        } else {
                            if(content.match(regexfound) === null)
                                {
                                    compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${this.replaceContent(content,allVariablewordConst,allVariableRaw).trim()}\n`
                                } else {
                                    const text = content.match(regexremove).join('').trim()
                                    const transform = this.replaceContent(text,allVariablewordConst,allVariableRaw)
                                    // console.log(transform)
                                    compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${transform}\n`
                                }
                                // totalDeclaration.length += this.checkdouble(totalDeclaration)
                                // console.log("B :",totalDeclaration)
                                // console.log(regexremove)
                                // const test = content.match(regexremove).join('').trim()
                                // console.log(test)
                                // console.log(allVariablewordConst,allVariableword,allVariableRaw)
                                // compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${this.replaceContent(content,allVariablewordConst,allVariableRaw)}\n`        
                        }
                    } else {
                        compiledContent += `//----------------------|${path.basename(fileArray[i])}|--------------------------------\n//${'fichier vide'}\n`
                    }
                }
            }
            // console.log(compiledContent)

            return compiledContent;
        } else if(options == 'normal'){
            for(let i = 0;i< fileArray.length;i++)
                {
                    if(fileArray[i] !== undefined)
                    {
                        let content = fs.readFileSync(fileArray[i],'utf-8')
                        if(content !== null)
                        {
                            if(content.match(regexfound) === null)
                            {
                                compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${content.trim()}\n`
                            } else {
                                compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${content.match(regexremove).join('').trim()}\n`
                            }
                        } else {
                            compiledContent += `//----------------------|${path.basename(fileArray[i])}|--------------------------------\n//'fichier vide'\n`
                        }
                    }
                }
                return compiledContent;
        }else {
            throw new Error(`option ${options} non reconnu`)
        }
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
            await this.complilerContentPromise(this.fileDirArray).then((data)=>{
                // const final = this.replaceContent(data)
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
            console.log(err.line)
        }   
    }

    async repopulatelinkFile()
    {
        const time = new Date(Date.now()).toString()
        const linkFile = path.join(process.cwd(),'public','versionning','linkFile.js')
            await this.complilerContentPromise(this.fileDirArray.slice(1,this.fileDirArray.length-1))
            .then((data)=>{
                setTimeout(()=>{
                    fs.truncate(linkFile,0,(err)=>{ 
                        if (err){ 
                            throw new Error(`erreur truncate ${time} \n${err}`);
                        }}
                    );
                    let content = "const THREE = require('three')\n"
                    content += data
                    content += this.getExportScript(this.getAllExportName(data))
                    fs.appendFile(linkFile,content,(err)=>{ 
                        if(err){ 
                            throw new Error(`erreur compilation linkfile ${time} \n${err}`);
                        }
                    console.log(chalk.green(`fichier link mise à jour ${time}`))
                    })
                },500)
            }).catch((err)=>{
                console.log(chalk.red(`${err} \n${new Date(Date.now()).toString()}`))
            })
    }

    getAllExportName(content)
    {
        const regexgetConst = /(?<=[c][o][n][s][t].)[^{][A-z0-9]*/g; 
        const regexgetfunction = /(?<=[f][u][n][c][t][i][o][n].)[A-z]*/g; 
        const getAllFunction = /(function)+.*[^]*.?\/*[}][^(function)+]/gm;
        const allConstinfile = content.match(regexgetConst)
        const alltheFunction = content.match(getAllFunction)
        if(alltheFunction !== null)
        {
            let contentfunc = ''
            for(let i = 0; i < alltheFunction.length; i++)
            {
                contentfunc += alltheFunction[i]
            }
            const allconstinFunc = contentfunc.match(regexgetConst)
            if(allconstinFunc !== null)
            {
                const diferrence = allConstinfile.filter((element)=> !allconstinFunc.includes(element))
                const allfuncinfile = content.match(regexgetfunction)
                const allinfile = diferrence.concat(allfuncinfile)
                return allinfile;
            } else {
                const allfuncinfile = content.match(regexgetfunction)
                const allinfile = allConstinfile.concat(allfuncinfile)
                return  allinfile
            }
        } else {
            return allConstinfile;
        }
    }

    addimportScript(file)                                          
    {
        const forbiden = []
        forbiden.push(path.join(process.cwd(),'threeElement','Setting','configImport.js'))
        forbiden.push(path.join(process.cwd(),'threeElement','Setting','resizeSetting.js'))
        forbiden.push(undefined)
        if(!forbiden.includes(file))
        {
            const content = fs.readFileSync(file,'utf-8')
            if(content !== null)
            {   
                const regexmatchRequire = /(const.{.*.}.[=].require)+.*/g
                const test = content.match(regexmatchRequire)
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
            } else {
                const text = "const {THREE,scene,camera} = require('../../public/versionning/linkFile.js')\n"
                        fs.appendFile(file,text,(err)=>{ 
                            if (err) 
                            { 
                                throw new Error(`erreur import Script`);
                            }
                        })
                        return console.log(chalk.green(`the import statement as been added to '${file}' `))
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

    complilerContentPromise(array) 
    {
        return new Promise((resolve,reject)=>
            {
                setTimeout(()=>{
                    reject("la compilation des donnée à pris trop de temps");
                },3000)
                const content = this.getContentFile(array,'normal')
                const declaration = this.getAllExportName(content)

                if(this.checkdouble(declaration) == false)
                {
                    // console.log(chalk.keyword('orange')('plusieur déclaration on été difini avec le meme nom \n la compilation ce fait quand meme mais la déclaration à été hacher sous un nom diférent'))
                    resolve(content);
                } else {
                    resolve(this.getContentFile(array))
                }
            },)
    }
}