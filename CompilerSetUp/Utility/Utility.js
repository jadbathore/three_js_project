import chalk from 'chalk';
import path from 'path';
import fs from 'fs'
import mongoose from 'mongoose';
import RecursiveMatcher from './RecursiveMatcher.js'





/**
 * @class Utility is use to do Some Utility work to the compiler here are all the methode use in se compilation phase
 * @constructor who need a array of file and a Map obj of the asset
 */
export default class Utility {
    
    #complierFile = path.join(process.cwd(),'public','versionning','compling.js')
    #matchregexRaw = /(let)+[^{][A-z]*.*/g;
    #matchregexWord = /(?<=let.)[^{][A-z]*/g;
    // #matchregexConstWord = /(?<=(\bconst\b((\s)+?)))(?!\[)(([A-z])|[A-z]\w+)*/g
    #matchregexConstWord = /(?<=const.)[^{][A-z]*/g;
    #matchparamAndConstDelcaration = /((?<=(\bconst\b((\s)+?)))(?!\[)(([A-z])|[A-z]\w+)*|(?<=(\bthis[.]\b))((([A-z])|[A-z]\w+)*)(?=((\s?)+?)[=]))/g;
    #matchparamDeclaration = /(?<=(\bthis[.]\b))((([A-z])|[A-z]\w+)*)(?=((\s?)+?)[=])/g
    #regexremove = /^((?!const.{(.*)}.[=].require)[\s\S])*$/gm;
    #regexfound = /\b(const.{.*)/g;
    #removeConstDeclaration = /\b(const.)\b/g;
    #regexgetConst = /(?<=const.)[^{[][A-z0-9]*/g; 
    #getfunctionName = /(?<=(\b(\t?)function\b((\s)+?)))(([A-z])|([A-z]\w+))(?=(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)/g
    #regexmatchRequire = /(const.{.*.}.[=].require)+.*/g;
    #regexDeclaration = /(?:(?=(?<=import.{.))[A-z,\s]*|(?!import.{.)((?<=import.*.as.)[A-z]*))/g;
    #regexpathimport = /(?<=from.')[A-z/.-]*/g;
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
     * @returns {Object} return a array object reusable like so (const a = thisgetTotaldecaration(text) ; console.log(a[0]))
     */
    getTotaldeclaration(text){
        const allVariableRaw = text.match(this.#matchregexRaw);
        const allVariableword = text.match(this.#matchregexWord);
        const allVariablewordConst = text.match(this.#matchregexConstWord);
        const paramAndConstDelcaration = text.match(this.#matchparamAndConstDelcaration);
        const matchparamDeclaration = text.match(this.#matchparamDeclaration);
        
        return {
            variableRaw:allVariableRaw,
            variableDeclaration:allVariableword,
            constant:allVariablewordConst,
            paramAndConstDelcaration:paramAndConstDelcaration,
            paramDeclaration:matchparamDeclaration
        };
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
        // for (let [oldStr, newStr] of Object.entries(replacements))
        for(let [key,values] of Object.entries(getAsset))
        {
            compiledContent+=`const ${key} = {\n`;
            for(let [key,value] of Object.entries(values))
            {
                compiledContent+=`${key}:'${value}',\n`
            }
            compiledContent+=`\n}\n`
        }
        if(options == null)
        {
            let totalDeclaration = [];
            for(let i = 0;i<fileArray.length;i++)
            {
                if(fileArray[i] !== undefined)
                {
                        const content = fs.readFileSync(fileArray[i],'utf-8')
                        const allmatcheddecaration = this.getTotaldeclaration(content)
                        // for(let i = 0;i<allmatcheddecaration.length;i++)
                        for(const [key,value] of Object.entries(allmatcheddecaration))
                        {
                            if(value !== null)
                                {
                                    totalDeclaration = totalDeclaration.concat(value)
                                } 
                        }
                        if(content !== null)
                        {
                            const double = this.checkdouble(totalDeclaration)
                            
                            if(double === false)
                            {
                                if(content.match(this.#regexfound) === null)
                                    {
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.trim()}\n//&end\n`
                                    } else {
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.match(this.#regexremove).join('').trim()}\n//&end\n`
                                    }
                            } else {
                                if(content.match(this.#regexfound) === null)
                                    {
                                        compiledContent += `//----|${path.basename(fileArray[i])}|----\n${this.replaceContent(content,double,allmatcheddecaration[0]).trim()}\n//&end\n`
                                    } else {
                                        const text = content.match(this.#regexremove).join('').trim()
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
                        const content = fs.readFileSync(fileArray[i],'utf-8');
                        if(content !== null)
                        {
                            if(content.match(this.#regexfound) === null)
                            {
                                compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.trim()}\n//&end\n`
                            } else {
                                compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content.match(this.#regexremove).join('').trim()}\n//&end\n`
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
     * @public important function to format the compiler contentin class format
     * @param {array} array fileArray use a array of file to compile all the ThreeElement dir   
     * @returns {string} compile file of all the array 
     */
    async getComposerContent(fileArray){

        let compiledContent = fs.readFileSync(fileArray[0],'utf-8');
        compiledContent += '\nclass Content {\n';
        const getAsset = this.getAssetPathConst();
        //-----param_asset-----
        for(let [key,values] of Object.entries(getAsset))
            {
                compiledContent+=`static ${key} = {\n`;
                for(let [key,value] of Object.entries(values))
                {
                    compiledContent+=`${key}:'${value}',\n`
                }
                compiledContent+=`\n}\n`
            }
        //-----constructor-----
        compiledContent+=`constructor(){\n`
        for(let i = 1;i< fileArray.length;i++)
        {
            const namefile = this.formatName(fileArray[i]);
            compiledContent += `\ndocument.addEventListener('load',this.${namefile}())`
        }
        compiledContent+='\n}\n';
        //-----methods-----
        let totalconstant = []; 
        for(let i = 1;i< fileArray.length;i++)
            {
                //TODO:condition retiré les class de la class principale 
                const contentRaw = fs.readFileSync(fileArray[i],'utf-8');
                //TODO:****test_de_ResursiveMatcher.Allclass()****
                // if(contentRaw.match(RecursiveMatcher.ClassStart) !== null){
                //     console.log(RecursiveMatcher.getAllClass(contentRaw))
                // }
                let content = ''
                const namefile = this.formatName(fileArray[i]);
                if(fileArray[i] !== undefined)
                {
                    content += `${namefile}(){\n`
                    content += `//----|${path.basename(fileArray[i])}|----\n`;
                    const constant = this.getTotaldeclaration(contentRaw);
                    if(constant.constant !== null)
                    {
                        constant.constant.forEach((element)=>{
                            totalconstant.push(element)
                        })
                    }
                    const cleanContent = await this.ContentCleaner(contentRaw,totalconstant)
                    content += `${cleanContent}\n//&end\n`; 
                }
            content += '\n}\n'
            compiledContent += `\n${content}\n`;
            }  
        if(compiledContent.match(this.#regexfound) !== null)
        {
            compiledContent = compiledContent.match(this.#regexremove).join('')
        }
            Object.keys(getAsset).forEach((e)=>{
            const regex = new RegExp(`\\b(${e}[.])\\b`,'g')
            if(compiledContent.match(regex) !== null)
                {
                    compiledContent = compiledContent.replace(regex,`Content.${e}.`)
                }
        })
        compiledContent += '\n}\n'
        compiledContent += `\nwindow.onload = () => {\n\tnew Content()\n}`;
        return compiledContent.trim();
    }

    async ContentCleaner(contentRaw,totalconstant){
        const condition = (contentRaw.match(this.#getfunctionName) !== null)
        let contentTransform = (condition)? this.replacorForFunctionPromise(contentRaw) : contentRaw;
        let cleanContent = '';
        if(contentTransform instanceof Promise)
            {   
                cleanContent = await contentTransform.then((dataObj)=>{
                    let tempsContent = dataObj.cleanText;
                    totalconstant.forEach((e)=> {
                        const regex = new RegExp(`\\b(${e})\\b`,'g') 
                        tempsContent = tempsContent.replace(regex,`this.${e}`)
                    });
                    if(tempsContent.match(this.#removeConstDeclaration) !== null)
                    {
                        tempsContent = tempsContent.replace(this.#removeConstDeclaration,'')
                    }
                    for(const [key,value] of Object.entries(dataObj.data))
                    {
                        const regex = new RegExp(`(?<=(\\bfunction\\b((\\s)+?))(\\b${key}\\b)(((\\s)?)+?)(\\((\\n*?)([^]*)(\\n*?)\\))((\\n*)?))\\{(#&@)\\}`,'g')
                        tempsContent = tempsContent.replace(regex,`\n{${value}}\n`)
                    }
                        return tempsContent
                    }).catch((err)=>{
                        throw err;
                    })
            } else {
                totalconstant.forEach((e)=>{
                const regex = new RegExp(`\\b(${e})\\b`,'g') 
                contentTransform = contentTransform.replace(regex,`this.${e}`)
                })
                if(contentTransform.match(this.#removeConstDeclaration) !== null)
                {
                    contentTransform = contentTransform.replace(this.#removeConstDeclaration,'')
                }
                cleanContent = contentTransform;
                }
        return cleanContent;
    }

    /**
     * @param {string} pathfile the path file to transform
     * @throws Error if is not a path file
     * @return string
     */
    formatName(pathfile){
        if (fs.lstatSync(pathfile).isFile())
        {
            return 'file_'+path.basename(pathfile).split('.js').join('');
        } else {
            throw new Error(`${pathfile} n'est pas un fichier`);
        }
    }

    /**
     * @param {string} text the path file to transform 
     * @throws Error if is not a path file
     * @return promise object of all text to replace the function for 
     */
    replacorForFunctionPromise(text){
        return new Promise((resolve,reject)=>{
            let ObjectToChange = {}
            //the to array must always have the same length
            const values = RecursiveMatcher.getAllFunctionContent(text)
            let textWithoutFunc = text;
            values.forEach((e)=>{
                //special caratere replacement
                textWithoutFunc = textWithoutFunc.replace(e,'#&@')
            })
            const keys = textWithoutFunc.match(this.#getfunctionName);
            if((values == null) || (keys == null))
            {
                reject(`no value or keys matched value:${values} keys:${keys}`)
            }
            if(values.length != keys.length){
                reject('error matching the key and the value doesn\'t have the same length')
            }
            for(let i=0;i<values.length;i++){
                ObjectToChange[keys[i]] = values[i]
            }
            resolve({
                data:ObjectToChange,
                cleanText:textWithoutFunc
            });
        })
    }
    /**
     * @public to just replace in the composer unique change the 'repopulate' method re-right all the script this one just replace what you need (in a macOS enviroment the 'repolulate' 
     * fonction might trigget 2 time when it's watched because of the pre-programming enviroment work that way but not with this method)  
     * @param {string} directory beginingFile string directory of the file you need to replace 
     * @param {string} directory endFile string directory  you use to replacing the file
     * @param {string} option option string directory  you use to replacing the file
     * @returns {fs.promises} fs.promises is return this one will write in the  fileToReplace directory the replacement.
     */
    lazyRemplacement(beginingFile,endFile){
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile)
        const endBaseName = path.basename(endFile)
        const tRegex = this.regexSectionMaker(endBaseName)
        fs.promises.readFile(beginingFile,{encoding:'utf-8'}).then((buffer)=>{
            const textToreplace = buffer.toString()
            let replacingContent = fs.readFileSync(endFile,'utf-8');
            if(replacingContent.match(this.#regexfound) !== null) {
                replacingContent = replacingContent.match(this.#regexremove).join('')
            }
            let totalDeclaration = [];
            const allmatcheddecaration = this.getTotaldeclaration(replacingContent);
            const textRemplacement = `\n//----|${endBaseName}|----\n${replacingContent}\n//&end`
            const totaltext = textToreplace.replace(tRegex,textRemplacement)
            for(const [key,value] of Object.entries(allmatcheddecaration))
                {
                    if(value !== null)
                        {
                            totalDeclaration = totalDeclaration.concat(value)
                        } 
                }
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`))
            return fs.promises.writeFile(beginingFile,totaltext)
        })
    }

    /**
     * 
     * @param {string} beginingFile the begining file (file who's replace)
     * @param {string} endFile the End file  (file take to replace the begining file)
     * @returns {fs.promises} fs.promises is return this one will write in the  fileToReplace directory the replacement.
     */
    async lazyComposerRemplacement(beginingFile,endFile){
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile)
        const endBaseName = path.basename(endFile)
        fs.promises.readFile(beginingFile,{encoding:'utf-8'}).then(async (buffer)=>{
            const tRegex = this.regexSectionMaker(endBaseName)
            const textToreplace = buffer.toString()
            const globalDelcaration = this.getTotaldeclaration(buffer.toString().replace(tRegex,'')).paramDeclaration;
            let replacingContent = fs.readFileSync(endFile,'utf-8');
            //--------------endfile---------------------
            if(replacingContent.match(this.#regexfound) !== null) {
                replacingContent = replacingContent.match(this.#regexremove).join('')
            }
            const inFileDecaration = this.getTotaldeclaration(replacingContent).constant;
            const totalDeclaration = globalDelcaration.concat(inFileDecaration)
            replacingContent = await this.ContentCleaner(replacingContent,totalDeclaration);
            //--------------beginingfile---------------------
            const textRemplacement = `\n//----|${endBaseName}|----\n${replacingContent}\n//&end`
            const totaltext = textToreplace.replace(tRegex,textRemplacement)
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`))
            return fs.promises.writeFile(beginingFile,totaltext)
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
     * 
     * @param {string} toSection 
     * @return make a regex to Cut a section in some text 
     * @example section must be like this :
        ```
        ...
        //----|loader.js|----
        const loader = new THREE.TextureLoader();
        //&end
        ...
        ```
     */
    regexSectionMaker(toSection)
    {
        return new RegExp(`(?=[/][/]----[|](${toSection})).+?(?<=[/][/](&end))`, "s");
    }
    
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
            fs.truncate(this.#complierFile, 0,(err)=>{ 
                if (err){ 
                    throw new Error(`erreur truncate ${time} \n${err}`);
                }}
            );
            await this.compilerContentPromise(this.fileDirArray,'composer')
            .then((data)=>{
            
            // data += `};\nwindow.onload = () => { content()}`;
                fs.appendFile(this.#complierFile,data,(error)=>{
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
            this.compilerContentPromise(this.fileDirArray.slice(1,this.fileDirArray.length-1),'linkfile')
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
        const allConstinfile = content.match(this.#regexgetConst);
        const alltheFunction = RecursiveMatcher.getAllFunctionContent(content);
        if(alltheFunction !== null){
            alltheFunction.forEach((e)=>{
                content = content.replace(e,'')
            }) 
        }
        let arrayDeclaration = this.getTotaldeclaration(content).constant;
        arrayDeclaration = content.match(this.#getfunctionName)?.concat(arrayDeclaration) ?? arrayDeclaration;
        return arrayDeclaration;
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
                const test = content.match(this.#regexmatchRequire)
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
     * @returns {object} object
     */
    getAssetPathConst()
    {
        const content = {}
        for(const [key, value] of this.mapAsset)
            {
                const subContent = {}
                if(key === 'img')
                {
                    // let content = `${key} = {\n`
                    for (const file of value)
                    {
                        if(path.basename(file).includes('.png'))
                            {
                                subContent[path.basename(file,'.png')] = path.join('asset','img',file);
                            } else if(path.basename(file).includes('.jpg')) {
                                subContent[path.basename(file,'.jpg')] = path.join('asset','img',file);
                            }
                    };
                } else {
                    // let content = `${key} = {\n`
                    for(const file of value)
                        {
                            subContent[path.basename(file,`.${key}`)] = path.join('asset',key,file);
                        }
                }
                content[key] = subContent;
            }
            return content
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
        const elementDict = {}
        const declaration = contentConfig.match(this.#regexDeclaration)
        const importpath = contentConfig.match(this.#regexpathimport)
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
    compilerContentPromise(array,typedata) 
    {
        return new Promise((resolve,reject)=>
            {
                setTimeout(()=>{
                    reject("la compilation des donnée à pris trop de temps");
                },3000)
                if(typedata == 'linkfile')
                {
                    const content = this.getContentFile(array,'normal')
                    const declaration = this.getAllExportName(content)
                    if(this.checkdouble(declaration) == false)
                    {
                        resolve(content);
                    } else {
                        resolve(this.getContentFile(array))
                    }
                } else if(typedata == 'composer'){
                    resolve(this.getComposerContent(array))
                } else {
                    reject(`typedata: ${typedata} non reconnu `)
                }
            },)
    }
}
