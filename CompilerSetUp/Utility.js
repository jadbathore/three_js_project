import chalk from 'chalk';
import path, { join } from 'path';
import fs, { Dir, readFile } from 'fs'
import mongoose from 'mongoose';

const complierFile = path.join(process.cwd(),'public','versionning','compling.js')




/**
 * @class Utility is use to do Some Utility work to the compiler here are all the methode use in se compilation phase
 * @constructor who need a array of file and a Map obj of the asset
 */
export default class Utility {
    
    /**
     * @param {array} array - fileDirArray is a array of unsorted file
     * @param {Map} Map - mapAsset is a object Map of all the asset(image/gltf...) you might need sorting this way : (dirName => [ file1.js , file2.js] )
     */
    constructor(fileDirArray,mapAsset)
    {
        this.fileDirArray = this.#mapContent(fileDirArray)
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
    */

    /**
    * @private sorting all the file array 1. configImport.js 2. RendererSetting.js 3. cameraSetting.js 4. loader.js 5. any other element + other 6. animate.js 7. resizing.js
    * @param {array} array arrat of file  use privately to sort the array needed
    * @returns {array} array sorted well
    */
    #mapContent(fileArray)
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
    */
    
    /**
     * @public replace any given name with a distinct hash to avoid constant or variable naming conflicts during compilation
     * @param {String} string -text : take a text to remplace 
     * @param {array} array - wordConst: nullable a array of word representing constant in the text
     * @param {array} array - variable: nullable a array of raw line representing variable (let) in the text
     * @returns {string} string of the text remplaced content
     */

    replaceContent(text,wordConst=null,VariableRaw=null)
    {
            const originalhash = new mongoose.Types.ObjectId().toString()
            
            if(wordConst != null)
            {
                for(let i=0;i<wordConst.length;i++)
                    {
                        const regex = new RegExp(`${wordConst[i]}+(?![A-z0-9])`,'g')
                        text = text.split(regex).join(`${wordConst[i]}_${originalhash}`);
                    }
            }
            if(VariableRaw !== null)
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
    /**
     * @public check if there is a double in an array then if so return them in another array (if is in a iterable you might want to correct the array length latter )
     * @param {array} array array parameter to check if there a double in this array
     * @returns {array|boolean} array|boolean array if there a double boolean false if not
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
                if(testArray.indexOf(array[i]) !== -1)
                {
                    doubleWord.push(array[i])
                } else {
                    testArray.push(array[i])
                }
            }
            return doubleWord;
        } else {
            return false;
        }
    }

    /**
     * @public this method is there to get all the déclaration in a text(string) like the constant and variable 
     * @param {string} string a text string to match all you want 
     * @returns {array} return a array object reusable like so (const a = thisgetTotaldecaration(text) ; console.log(a[0]))
     */
    getTotaldecaration(text){
        const matchregexRaw = /(let)+[^{][A-z]*.*/g;
        const matchregexWord = /(?<=let.)[^{][A-z]*/g;
        const matchregexConstWord = /(?<=const.)[^{][A-z]*/g;
        const regexfunctionall = /(function)+.*[^]*.?\/*[}][^(function)+]/gm;
        const content = text.split(regexfunctionall).join('\n');
        const allVariableRaw = content.match(matchregexRaw);
        const allVariableword = content.match(matchregexWord);
        const allVariablewordConst = content.match(matchregexConstWord);
        return new Array(allVariableRaw,allVariableword,allVariablewordConst);
    }

    /*
    français:
        fonction importante permetant de formatter le contenu deux options :
        - option "normal" compilation classique sans hash (il n'y a pas eu d'erreur de nommage)
        - ou compilation suivant la logique de remplacement des constants en doublons
    */
    
    /**
     * @public important function to format the content two options:
        - "normal" option classic compilation without hash (there was no naming error)
        - or compilation following the logic of replacing duplicate constants
     * @param {array} array fileArray use a array of file to compile all the ThreeElement dir
     * @param {string} string option use in 2 stuation might be 'normal' 
     * @throws Error - if the param option is not found
     * @returns {string} compile file of all the array 
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
            let totalDeclaration = [];
            for(let i = 0;i<fileArray.length;i++)
            {
                if(fileArray[i] !== undefined)
                {
                        const content = fs.readFileSync(fileArray[i],'utf-8')
                        const allmatcheddecaration = this.getTotaldecaration(content)
                        for(let i = 0;i<allmatcheddecaration.length;i++)
                        {
                            if(allmatcheddecaration[i] !== null)
                                {
                                    totalDeclaration = totalDeclaration.concat(allmatcheddecaration[i])
                                } 
                        }
                        if(content !== null)
                        {
                            const double = this.checkdouble(totalDeclaration)
                            
                            if(double === false)
                            {
                                if(content.match(regexfound) === null)
                                    {
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.trim()}\n//&end\n`
                                    } else {
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.match(regexremove).join('').trim()}\n//&end\n`
                                    }
                            } else {
                                if(content.match(regexfound) === null)
                                    {
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${this.replaceContent(content,double,allmatcheddecaration[0]).trim()}\n//&end\n`
                                    } else {
                                        const text = content.match(regexremove).join('').trim()
                                        const transform = this.replaceContent(text,double,allmatcheddecaration[0])
                                        double.forEach((e)=>{
                                            totalDeclaration.splice(totalDeclaration.indexOf(e),10-9)
                                        })
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${transform}\n//&end\n`
                                    } 
                                    if(path.basename(fileArray[i]) == 'configImport.js')
                                        {
                                            compiledContent += '\nconst content = () => {\n'
                                        } 
                            }
                        } else {
                            compiledContent += `//----|${path.basename(fileArray[i])}|----\n//'fichier vide'\n//&end\n`
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
                                compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.trim()}\n//&end\n`
                            } else {
                                compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.match(regexremove).join('').trim()}\n//&end\n`
                            }
                        } else {
                            compiledContent += `//----|${path.basename(fileArray[i])}|----\n//'fichier vide'\n//&end\n`
                        }
                        if(path.basename(fileArray[i]) == 'configImport.js')
                            {
                                compiledContent += '\nconst content = () => {\n'
                            }
                    }
                }
                return compiledContent;
        }else {
            throw new Error(`option ${options} non reconnu`)
        }
    }

    /**
     * @public to just replace in the composer unique change the 'repopulate' method re-right all the script this one just replace what you need (in a macOS enviroment the 'repolulate' 
     * fonction might trigget 2 time when it's watched because of the pre-programming enviroment work that way but not with this method)  
     * @param {string} directory fileToReplace string directory of the file you need to replace 
     * @param {string} directory fileReplacing string directory  you use to replacing the file
     * @returns {fs.promises} fs.promises is return this one will write in the  fileToReplace directory the replacement.
     */
    lazyRemplacementComposer(fileToReplace,fileReplacing){
        let time = new Date(Date.now()).toString();
        const regexremove = /^((?!const.{.*.}.[=].require)[\s\S])*$/gm
        const regexfound = /\b(const.{.*)/g
        const fileToReplaceBaseName = path.basename(fileToReplace)
        const fileReplacingBaseName = path.basename(fileReplacing)
        const tRegex = new RegExp(`(?=[/][/]----[|](${fileReplacingBaseName})).+?(?<=[/][/](&end))`, "s");
        fs.promises.readFile(fileToReplace,{encoding:'utf-8'}).then((buffer)=>{
            const textToreplace = buffer.toString()
            let replacingContent = fs.readFileSync(fileReplacing,'utf-8');
            if(replacingContent.match(regexfound) !== null) {
                replacingContent = replacingContent.match(regexremove).join('')
            }
            const textRemplacement = `\n//----|${fileReplacingBaseName}|----\n${replacingContent}\n//&end`
            const totaltext = textToreplace.replace(tRegex,textRemplacement)
            let totalDeclaration = [];
            const allmatcheddecaration = this.getTotaldecaration(totaltext);
            for(let i = 0;i<allmatcheddecaration.length;i++)
                {
                    if(allmatcheddecaration[i] !== null)
                        {
                            totalDeclaration = totalDeclaration.concat(allmatcheddecaration[i])
                        } 
                }
            const double = this.checkdouble(totalDeclaration)
            if(double == false)
            {
                console.log(chalk.green(`fichier ${fileToReplaceBaseName} mise à jour ${time}`))
                return fs.promises.writeFile(fileToReplace,totaltext)
            } else {

                console.log(chalk.green(`fichier ${fileToReplaceBaseName} mise à jour ${time}`))
                return fs.promises.writeFile(fileToReplace,this.replaceContent(totaltext,double,allmatcheddecaration[0]))
            }
        })
    }

    /*
    français:
        permet de compléte le dossier public/versionning/compiling.js automatiquement 
        il attent que la promesse complilerContentPromise() retourne ce qu'il faut selon la situation donnée 
    English:
        allows to complete the public/versioning/compiling.js folder automatically
        it waits for the promise compilerContentPromise() to return what is needed according to the given situation
    */
    
    /**
     * @public allows to complete the public/versioning/compiling.js folder automatically
        it waits for the promise compilerContentPromise() to return what is needed according to the given situation (in a macOS enviroment the 'repolulate' 
     * fonction might trigget 2 time when it's watched because of the pre-programming enviroment work that way)  
     * @returns {void} void
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
            
            data += `};\nwindow.onload = () => { content()}`;
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
    */
    /**
     * @public allows to complete the public/versioning/linkFile.js folder automatically
        it waits for the promise compileContentPromise()to return what is needed according to the given situation(in a macOS enviroment the 'repolulate'fonction might trigget 2 
        time when it's watched because of the pre-programming enviroment work that way)
     * @returns {void} void
     */
    repopulatelinkFile()
    {
        const time = new Date(Date.now()).toString()
        const linkFile = path.join(process.cwd(),'public','versionning','linkFile.js')
            this.complilerContentPromise(this.fileDirArray.slice(1,this.fileDirArray.length-1))
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
    /**
     * @public find all the constants to export later
     * @param {string} string get all the content of the export name;
     * @returns {array} array 
     */
    getAllExportName(content)
    {
        const regexgetConst = /(?<=const.)[^{[][A-z0-9]*/g; 
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
    */
    /**
     * @public add an import script
     * @param {string} file string 
     * @returns string
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
    */
    /**
    * @public formats a useful export script for the linkFile.js file
    * @param {*} constArray a array of const form get all export script
    * @returns string
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
    /**
     * @public format a useful import script allowing the use of constants previously found by the getAllExportName() method
     * @returns {void} void
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
    */

    /**
     * @public formats a dictionary useful to linkFile of all accesses
        example:
        const glb = {
            donus:'asset/glb/donus.glb',
            earth:'asset/glb/earth.glb',
        }
        (because the express server uses a static the path used is the previous 'asset(true path: public/asset)/...')
        then is reusable in this way: glb.donus (it is in the list of the basic import script)
        the addition is automatic so if more is needed creates a folder that has the name of the extension (example: hdr => gun.hdr)
     * @returns {void} void
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
    */ 
   /**
    * @public retrieves from the three Element/Setting/config Import.js folder the useful 
    elements such as the name and the external import path
    * @returns array
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
    */ 
    /**
     * @public formats a CommunJs script starting from the base of the configImport.js folder (which is in module-es)
        using the import as a means of accessing the added external module such as three, or canon-es for example.
     * @returns string
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
    */ 
    /**
     * @public promise used by 'repopulate' functions actually depending on the situation:
        - is rejected (it took too long)
        - is resolved however there are duplicates and therefore data using a hash on certain element and send
        - is resolved there is no duplicate of data 'normal' its send
     * @param {array} array array of file already sorted
     * @returns {promise} promise
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