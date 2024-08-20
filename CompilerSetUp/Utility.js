import chalk from 'chalk';
import path from 'path';
import fs from 'fs'
import mongoose from 'mongoose';


const complierFile = path.join(process.cwd(),'public','versionning','compling.js')

export default class Utility {

    constructor(fileDirArray,mapAsset)
    {
        this.fileDirArray = this.mapContent(fileDirArray)
        this.mapAsset = mapAsset
    }
    /*
    français:
        permet de organise l'ordre des entré pour que le compilateur effectue sa fonction de manière souhaite 
        1.  configImport.js 
        2.  RendererSetting.js 
        3.  cameraSetting.js
        4.  loader.js
        5.  n'importe quel element autre + autre 
        6.  animate.js
        7.  resizing.js
    English:
        allows to organize the order of inputs so that the compiler performs its function in the desired way
        1. configImport.js
        2. RendererSetting.js
        3. cameraSetting.js
        4. loader.js
        5. any other element + other
        6. animate.js
        7. resizing.js
    */
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
    /*
    français:
        remplacer par un hash distin tout nom donné pour évite des confits de nommage de constant ou de variable lors de la compilation
    english:
        replace any given name with a distinct hash to avoid constant or variable naming conflicts during compilation
    */
    replaceContent(text,wordConst=null,VariableRaw=null)
    {
            const originalhash = new mongoose.Types.ObjectId().toString()
            
            if(wordConst != null)
            {
                for(let i=0;i<wordConst.length;i++)
                    {
                        text = text.split(wordConst[i]).join(`${wordConst[i]}_${originalhash}`);
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
    /*
    français:
        verifier si in y a un double dans un array puis si c'est le cas les retournes dans une autre array
    English:
        check if there is a double in an array then if so return them in another array
    */
    checkdouble(array)
    {
        const setformarray = new Set(array)
        if (array.length !== setformarray.size)
        {
            let testArray = []
            let doubleWord = []
            for(let i = 0;i<array.length;i++)
            {
                if(testArray.includes(array[i]))
                {
                    doubleWord.push(array[i])
                    array.length -= i
                } else {
                    testArray.push(array[i])
                }
            }
            return doubleWord;
        } else {
            return false;
        }
    }
    
    /*
    français:
        fonction importante permetant de formatter le contenu deux options :
        - option "normal" compilation classique sans hash (il n'y a pas eu d'erreur de nommage)
        - ou compilation suivant la logique de remplacement des constants en doublons
    English:
        important function to format the content two options:
        - "normal" option classic compilation without hash (there was no naming error)
        - or compilation following the logic of replacing duplicate constants
    */
    getContentFile(fileArray,options=null)
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
            const matchregexConstWord = /(?<=const.)[^{][A-z]*/g;

            let totalDeclaration = [];
            for(let i = 0;i<fileArray.length;i++)
            {
                if(fileArray[i] !== undefined)
                {
                    let content = fs.readFileSync(fileArray[i],'utf-8')
                    const allVariableRaw = content.match(matchregexRaw)
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
                        const double = this.checkdouble(totalDeclaration)
                        if(double === false)
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
                                    const transform = this.replaceContent(text,double,allVariableRaw)
                                    compiledContent += `//----------------------|${path.basename(fileArray[i])}|----------------------------------\n${transform}\n`
                                }  
                        }
                    } else {
                        compiledContent += `//----------------------|${path.basename(fileArray[i])}|--------------------------------\n//${'fichier vide'}\n`
                    }
                }
            }
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
    /*
    français:
        permet de compléte le dossier public/versionning/compiling.js automatiquement 
        est asynchrone du fait que il attent que la promesse complilerContentPromise() retourne ce qu'il faut selon la situation donnée 
    English:
        allows to complete the public/versioning/compiling.js folder automatically
        is asynchronous because it waits for the promise compilerContentPromise() to return what is needed according to the given situation
    */
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
        }   
    }
    /*
    français:
        permet de compléte le dossier public/versionning/linkFile.js automatiquement 
        est asynchrone du fait que il attent que la promesse complilerContentPromise() 
        retourne ce qu'il faut selon la situation donnée
    English:
        allows to complete the public/versioning/linkFile.js folder automatically
        is asynchronous because it waits for the promise compileContentPromise() 
        to return what is needed according to the given situation
    */
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
                    let content = `//generate with configImport.js\n${this.getImportCommunJsScript()}`
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

    /*
    français:
        trouve toute les constant a exporté plus tard 
    French:
        find all the constants to export later
    */
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
    /*
    français:
        ajoute u script d'import  
    English:
        add an import script
    */
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
    /*
    français:
        formate un script d'export utile pour le fichier linkFile.js
    English:
        formats a useful export script for the linkFile.js file
    */
    getExportScript(constArray)
    {
        let exportsScript = ''
        for(const [key,value] of Object.entries(this.getConfigUtilty()))
        {
            if(!key.includes(","))
            {
                exportsScript += `exports.${key} = ${key}\n`
            } else {
                const alldeclaration = key.split(',')
                alldeclaration.forEach((element)=>{
                    exportsScript += `exports.${element} = ${element}\n`
                })
            }
        }
        for(let i = 0; i < constArray.length; i++)
        {
            exportsScript+=`module.exports = {${constArray[i]}}\n`
        }
        return exportsScript;
    }

    /*
    français:
        formate un script d'import utile permettant l'utlisation des constant précedament trouver par la method getAllExportName()
    English:
        format a useful import script allowing the use of constants previously found by the getAllExportName() method
    */
    getImportStript(){
        const theConst = this.getAllExportName(this.getContentFile(this.fileDirArray))
        let importScript = '\nconst {'
        for(let i = 0;i< theConst.length;i++)
        {
            importScript += `${theConst[i]},`
        }
        importScript+= `} = require('../../public/versionning/linkFile.js')\n`
        return importScript
    }

    /*
    français:
        formatte un dictonnaire utile à linkFile de tout les access 
        exemple :
        const glb = {
            donus:'asset/glb/donus.glb',
            earth:'asset/glb/earth.glb',
        }
        (du fait que le serveur express utlise un static le chemin utliser est le précedent 'asset(vrai chemin: public/asset)/...')
            puis est réutilisable de cette manière : glb.donus (c'est dans la liste de l'import script de base)
            l'ajout est automatique donc si il en faut plus crée un dossier qui à le nom de l'extention (exemple : glb => gun.glb)
    English:
        formats a dictionary useful to linkFile of all accesses
        example:
        const glb = {
            donus:'asset/glb/donus.glb',
            earth:'asset/glb/earth.glb',
        }
        (because the express server uses a static the path used is the previous 'asset(true path: public/asset)/...')
        then is reusable in this way: glb.donus (it is in the list of the basic import script)
        the addition is automatic so if more is needed creates a folder that has the name of the extension (example: hdr => gun.hdr)
    */
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
                } else {
                    let content = `${key} = {\n`
                    for(const file of value)
                        {
                            content+= `${path.basename(file,`.${key}`)}:'${path.join('asset',key,file)}',\n`;
                        }
                        content += '}\n'
                        arraycontent.push(content)
                }
            }
            return arraycontent
    }
    
    /*
    français:
        récupère du dossier threeElement/Setting/configImport.js 
        les élements uile tel que les nom ainsi que les chemin d'importation externe
    english:
        retrieves from the three Element/Setting/config Import.js folder the useful 
        elements such as the name and the external import path
    */ 
    getConfigUtilty(){
        const configFile = path.join(process.cwd(),'threeElement','Setting','configImport.js')
        const contentConfig = fs.readFileSync(configFile,'utf-8')
        const regexDeclaration = /(?:(?=(?<=import.{.))[A-z,\s]*|(?!import.{.)((?<=import.*.as.)[A-z]*))/g
        const regexpathimport = /(?<=from.')[A-z/.-]*/g
        const elementDict = {}
        const declaration = contentConfig.match(regexDeclaration)
        const importpath = contentConfig.match(regexpathimport)
        for(let i = 0;i<declaration.length;i++)
        {
            elementDict[declaration[i].trim()] = importpath[i]
        }
        return elementDict;
    }

    /*
    français:
        formate un script CommunJs en partant de la base du dossier configImport.js(qui lui est en module-es)
        utilsant l'importation comme moyen d'accédés au module externe ajouté tel que three, ou canon-es par exemple.
    English:
        formats a CommunJs script starting from the base of the configImport.js folder (which is in module-es)
        using the import as a means of accessing the added external module such as three, or canon-es for example.
    */ 
    getImportCommunJsScript()
    {
        let content = ''
        const configUtility = this.getConfigUtilty()
        for(const [key,value] of Object.entries(configUtility))
        {
            if(!key.includes(','))
            {
                content += `const ${key} = require('${value}')\n`;
            } else {
                content += `const {${key}} = require('${value}')\n`;
            }
        }
        return content
    }

    /*
    français:
        promesse utilisé par les fonctions 'repopulate' en fait selon la situation :
        - est rejeté (cela a pris tromp de temps)
        - est résolu par contre il y à des doublons et donc des données utlisant un hashage sur certain élément et envoyer
        - est résolu il n'y a pas de doublon des donnée 'normal' son envoyer 
    English:
        promise used by 'repopulate' functions actually depending on the situation:
        - is rejected (it took too long)
        - is resolved however there are duplicates and therefore data using a hash on certain element and send
        - is resolved there is no duplicate of data 'normal' its send
    */ 
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
                    resolve(content);
                } else {
                    resolve(this.getContentFile(array))
                }
            },)
    }
}