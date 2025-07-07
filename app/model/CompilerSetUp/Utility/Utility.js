import chalk from 'chalk';
import path, { basename } from 'path';
import fs from 'fs'
import RecursiveMatcher from './RecursiveMatcher.js'
import PathUtility from './pathUtility.js';

/**
 * @class Utility is use to do Some Utility work to the compiler here are all the methode use in se compilation phase
 * @constructor who need a array of file and a Map obj of the asset
 */
export default class Compile {
    /**
    *```
    /(?<=(\blet\b)(\s+))(([A-z]|[A-z]\w+)*)/g;
    *```
    */
    #matchregexVariableDeclaration = /(?<=(\blet\b)(\s+))(([A-z]|[A-z]\w+)*)/g;
    /**
    *```
    /((\/\/).+|(\/[*](.*\n)+[*]\/))/g;
    *```
    */
    #commentRemover = /((\/\/).+|(\/[*](.*\n)+[*]\/))/g
    /**
    *```
    /(?<=\b(const(\s)+?)\b)(([A-z]|[A-z]\w+)*)/g;
    *```
    */
    #matchregexConstantDelcaration = /(?<=\b(const(\s)+?)\b)(([A-z]|[A-z0-9]+)*)/g
    /**
    *```
    /(?<=(\bthis[.]\b))((([A-z])|[A-z]\w+)*)(?=((\s?)+?)[=])/g;
    *```
    */
    #matchparamDeclaration = /(?<=(\bthis[.]\b))((([A-z])|[A-z]\w+)*)(?=((\s?)+?)[=])/g
    /**
    *```
    /(\bconst\b)(([\s]+)?)(\{([\s\S]?)+\})([\s]+)[=]([\s]+)(\brequire\b)\(([\'].*[\'])\)/g;
    *```
    */
    #regeximportStatementCommunjs = /(\bconst\b)(([\s]+)?)(\{([\s\S]?)+\})([\s]+)[=]([\s]+)(\brequire\b)\(([\'].*[\'])\)/g;
    /**
    *```
    /(\bconst\b)(\s?)+(((\_\_)([A-z]|[A-z]\w+)(\_\_)))(\s?)+(\=)(\s?)+(\{(\s?)+\})/g;
    *```
    */
    #namespaceObjectRegex = /(\bconst\b)(\s?)+(((\_\_)([A-z]|[A-z]\w+)(\_\_)))(\s?)+(\=)(\s?)+(\{(\s?)+\})/g;
    /**
    *```
    /(?<=(\b(\t?)function\b((\s)+?)))(([A-z])|([A-z]\w+))(?=(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)/g;
    *```
    */
    #getfunctionName = /(?<=(\b(\t?)function\b((\s)+?)))(([A-z])|([A-z]\w+))(?=(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)/g
    /**
    *```
    /(?:(?=(?<=import.{.))[A-z,\s]*|(?!import.{.)((?<=import.*.as.)[A-z]*))/g;
    *```
    */
    #regexDeclaration = /(?:(?=(?<=import.{.))[A-z,]*|(?!import.{.)((?<=import.*.as.)[A-z]\w+))/g;
    /**
    *```
    /(?<=from.')[A-z/.-]* /g;
    *```
    */
    #regexpathimport = /(?<=from.(\'|\"))[A-z/.-]*/g;
    /**
    *```
    /(\n\s|\n)* /g;
    *```
    */
    #regexremoveBlank = /(\n\s)/g;

    /**
     * @type {Array<*>}
     */
    #allConstant = []

    /**
     * @type {string}
     */
    #compilerDir

    /**
     * 
     * @param {string} [compilerDir] 
     */
    constructor(compilerDir)
    {
        
        let fileDirArray = PathUtility.getarrayFile(compilerDir);
        this.fileDirArray = this.setMapFile(fileDirArray);
        this.mapAsset = PathUtility.getMapAsset();
        this.#compilerDir = compilerDir

    }


    /**
     * 
     * @param {*} text 
     */
    setAllConstant(text){
        const objectmatchDelcaration = this.getTotaldeclaration(RecursiveMatcher.contentCleanerRecursion(text))
        this.#allConstant = Object.values(objectmatchDelcaration).flat().filter(e=>e!=null) ?? [];
    }

    /**
     * 
     * @param  {...any} array
     */
    addToAllConstant(...array){
        this.#allConstant = this.#allConstant?.concat(array) ?? array
    }

    /**
     * 
     * @param {*} start 
     * @param {*} end 
     * @returns 
     */
    getfileDirarraySlice(start,end)
    {
        return this.fileDirArray.slice(start,end)
    }

    get allConstant(){
        return this.#allConstant;
    }

    /*
    français:
        permet de organise l'ordre des entré pour que le compilateur effectue sa fonction de manière souhaite 
        1.configImport.js 
        2.RendererSetting.js 
        3.cameraSetting.js
        4.loader.js
        n'importe quel element autre + autre 
        5.animate.js
        6.resizing.js
    */

    /**
     * @param {String[]} fileArray 
     * @returns 
     */
    setMapFile(fileArray)
    {
        let ii = 1;
        const organisedArray = [];
        const iterator = fileArray[Symbol.iterator]();
        for (const value of iterator) {
            switch(path?.basename(value))
            {
                case'2.RendererSetting.js':organisedArray[0] = value;break;
                case'3.cameraSetting.js':organisedArray[1] = value;break;
                case'4.loader.js':organisedArray[2] = value;break;
                case'animate.js': organisedArray[fileArray.length - 2] = value;break;
                case'resizeSetting.js':organisedArray[fileArray.length - 1] = value;break;
                case undefined: break;
                default: organisedArray[2+ii] = value;
                ii++;
                break;
            }
        }
        return organisedArray;
    }   

    /**
     * @public replace any given name with a distinct hash to avoid constant or variable naming conflicts during compilation
     * @param {String} text : take a text to remplace 
     * @param {Array<string>} arrayWord: nullable a array of word representing constant in the text
     * @param {Array<string>} objNameSpace : nullable a array of raw line representing variable (let) in the text
     * @returns {string} string of the text remplaced content
     */
    replaceContent(text,arrayWord,objNameSpace)
    {
        for(const word of arrayWord)
        {
            const regex = this.regexChangerConst(word);
            text = text.replace(regex,`${objNameSpace}.${word}`);
        }
        return text
    }

    /**
     * @param {string} file 
     * @returns 
     */
    nameSpaceMaker(file){
        const formatName = this.formatName(file,'__','__');
        let content = `const ${formatName} = {}\n`
        return content
    }

    /*
    français:
        verifier si in y a un double dans un array puis si c'est le cas les retournes dans une autre array
    English:
        check if there is a double in an array then if so return them in another array
    */
    /**
     * @public check if there is a double in an array then if so return them in another array (if is in a iterable you might want to correct the array length latter )
     * @param {String} array array parameter to check if there a double in this array
     * @returns {Compiler.double} object of 2 array double the found double in array(null if not found), uniqueArray the clean array without double
     */
    checkdouble(array)
    {
        const uniqueArray = [...new Set(array)];
        let i = 0;
        const condition = (array.length != uniqueArray.length);
        //@ts-ignore
        const double = (condition)?array.filter((e)=>{
            if(e != uniqueArray[i])
            {
                return e
            } else {
                i++;
            }
        }):null;
        return {
            double:double,
            uniqueArray:uniqueArray
        };
    }

    /**
     * @public this method is there to get all the déclaration in a text(string) like the constant and variable 
     * @param {string} text a text string to match all you want 
     * @returns {Compiler.declarations} return a array object reusable like so (const a = thisgetTotaldecaration(text) ; console.log(a[0]))
     */
    getTotaldeclaration(text){
        const allVariable = text.match(this.#matchregexVariableDeclaration);
        const allVariablewordConst = text.match(this.#matchregexConstantDelcaration);
        const allFunctionName = text.match(RecursiveMatcher.functionName);
        const allClassName = text.match(RecursiveMatcher.ClassName);
        return {
            variableDeclaration:allVariable,
            constant:allVariablewordConst,
            functionName:allFunctionName,
            allClassName:allClassName
        };
    }

    /**
     * @param {*} text 
     * @returns {Compiler.classDeclaration}
     */
    getClassDeclaration(text){
        const allVariablewordConst = text.match(this.#matchregexConstantDelcaration);
        const matchparamDeclaration = text.match(this.#matchparamDeclaration);
        return {
            paramClass:matchparamDeclaration,
            constant:allVariablewordConst,
        };
    }

    /*
    français:
        fonction importante permetant de formatter le contenu deux options :
        - option "normal" compilation classique sans hash (il n'y a pas eu d'erreur de nommage)
        - ou compilation suivant la logique de remplacement des constants en doublons
    */
    
    /**
     * @param {string[]} fileArray 
     * @returns {Promise<string>}
     */
    async getContentFile(fileArray)
    {
        let compiledContent = `//generate with configImport.js\n${this.getImportCommunJsScript()}\n`;
        const getAsset = this.getAssetPathConst()
        for(let [key,values] of Object.entries(getAsset))
        {
            compiledContent+=`const ${key} = {\n`;
            for(let [key,value] of Object.entries(values))
            {
                compiledContent+=`${key}:'${value}',\n`
            }
            compiledContent+=`\n}\n`
        }
        /**
         * @type String[]
         */
        let totalDeclaration = []
            for(let i = 0;i< fileArray.length;i++)
            {
                if(fileArray[i] !== undefined)
                {
                    let content = fs.readFileSync(fileArray[i],'utf-8');
                    content = this.cleanerCommunJsDeclaration(content);
                    const DeclarationObject = this.getTotaldeclaration(RecursiveMatcher.contentCleanerRecursion(content));
                    const allMatchedDecaration = Object.values(DeclarationObject).flat().filter(e=>e!=null);
                    totalDeclaration = totalDeclaration?.concat(allMatchedDecaration) ?? [];
                    //@ts-ignore
                    const optionalNamespace = await this.doubleDeclarationHandler(totalDeclaration,fileArray[i]);
                    if(optionalNamespace != null)
                    {
                        //@ts-ignore
                        let cleanContent = this.replaceContent(content,optionalNamespace.double,optionalNamespace.objNameSpace)
                        //@ts-ignore
                        content = optionalNamespace.data + cleanContent;
                        //@ts-ignore
                        totalDeclaration = optionalNamespace.clean;
                    }
                    compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content}\n//&end\n`
                }
                
            }
            compiledContent +=this.getExportScript(this.getAllExportName(compiledContent))
            return compiledContent.trim();
    }


    /**
     * @param {*} array 
     * @param {*} file 
     * @returns {Promise<?string>}
     */
    ObjectNamespaceMakerPromise(array,file){
    return new Promise((resolve,reject)=>{
        if(array == null){
            resolve(null)
        }
            reject(this.nameSpaceMaker(file));  
    })
    }

    /**
     * 
     * @param {*} array 
     * @param {*} file 
     * @returns {Promise<*>}
     */
    async doubleDeclarationHandler(array,file){
        const {double,uniqueArray} = this.checkdouble(array)
        // const foundDouble = doubleObject.double;
        const ObjectMakerPromise = this.ObjectNamespaceMakerPromise(double,file);
        /**
         * @type {Object}
         */
        let objectNamespaceContent;
        await ObjectMakerPromise.then((data)=>{
                objectNamespaceContent = data
            })
        .catch((dataErr)=>{
            const namespaceKey = this.formatName(file,'__','__')
            objectNamespaceContent = {
                double:double,
                data:dataErr,
                clean:uniqueArray,
                objNameSpace:namespaceKey,
            }
            
        }).finally(()=>{
            return objectNamespaceContent
        })
        return objectNamespaceContent;
    }
    /**
     * @public important function to format the compiler contentin class format
     * @param {String[]} fileArray fileArray use a array of file to compile all the ThreeElement dir   
     * @returns {Promise<string>} compile file of all the array 
     */
    async getComposerContent(fileArray){
        let compiledContent = "import { ImageCache,ImagesCacheHandler } from '../../../_types/app/model/cache/cacheImageUtility.js'"
        compiledContent += this.getImportEsmScript();
        compiledContent += '//----|Class_Content|----\n//No Class\n//&end'
        compiledContent += '\nclass Content {\n';
        const getAsset = this.getAssetPathConst();
        //-----param_asset-----
        for(let [key,values] of Object.entries(getAsset))
            {
                compiledContent+=`static ${key} = {\n`;
                for(let [key,value] of Object.entries(values))
                {
                    compiledContent+=`${key}:new ImageCache('${value}'),\n`
                }
                compiledContent+=`\n}\n`
            }
        //-----constructor-----
        compiledContent+=`constructor(){\n`
        for(let i = 0;i< fileArray.length;i++)
        {
            const namefile = this.formatName(fileArray[i],'file_');
            compiledContent += `\nthis.${namefile}()`
        }
        compiledContent+='\n}\n';
        //-----methods-----
        /**
         * @type String[]
         */
        let totalConstant = [];
        let totalClass = ''; 
        for(let i = 0;i< fileArray.length;i++)
            {
                const Raw = fs.readFileSync(fileArray[i],'utf-8');
                const condition = (Raw.match(RecursiveMatcher.ClassStart) !== null)
                const contentRaw = (condition)? await this.DeletorForClassPromise(Raw).then((dataObj)=>{
                    totalClass += dataObj.value.join('\n');
                    return dataObj.data
                }):Raw;
                const namefile = this.formatName(fileArray[i],'file_');
                let content = this.cleanerCommunJsDeclaration(contentRaw);
                if(fileArray[i] !== undefined)
                {
                    const declarationObject = this.getTotaldeclaration(RecursiveMatcher.contentCleanerRecursion(content));
                    const allMatchedDecaration = Object.values(declarationObject).flat().filter(e=>e!=null);
                    totalConstant = totalConstant?.concat((declarationObject.constant ?? [])) ?? [];
                    const optionalNamespace = await this.doubleDeclarationHandler(totalConstant,fileArray[i]);
                    if(optionalNamespace != null)
                    {
                        let contentNameSpaced = this.replaceContent(content,optionalNamespace.double,optionalNamespace.objNameSpace)
                        content = optionalNamespace.data + contentNameSpaced;
                        totalConstant = optionalNamespace.clean
                        totalConstant.push(optionalNamespace.objNameSpace);
                        console.log(
                            chalk.bgYellow(chalk.black(`A nameSpaceObject has been made in file:(${path.basename(fileArray[i])}) due to multiple same name constant declaration`),
                            chalk.black(`\nyou must use ${optionalNamespace.objNameSpace}.(${optionalNamespace.double}) for reference in other file`),
                            '\n'
                        ));
                    }
                    const cleanContent = await this.ContentCleaner(content,totalConstant,Object.keys(getAsset));
                    content = `${cleanContent}\n//&end\n`; 
                }
            compiledContent += `${namefile}(){\n//----|${path.basename(fileArray[i])}|----\n${content}\n}\n`;
            }  
        compiledContent = this.cleanerCommunJsDeclaration(compiledContent)
        compiledContent += '\n}\n'
        compiledContent += `\ndocument.addEventListener('DOMContentLoaded', async() => {\n\tnew Content()\n\tawait ImagesCacheHandler.saveNameToLocalStorage()\n});\n `;
        const tregex = this.regexSectionMaker('Class_Content');
        compiledContent = compiledContent.replace(tregex,totalClass)
        return compiledContent.trim();
    }

    /**
     * 
     * @param {string} contentRaw raw content of the file 
     * @param {string[]} totalConstant every constant in the file 
     * @param {string[]} asset 
     * @returns string clean content
     */
    async ContentCleaner(contentRaw,totalConstant,asset){
        asset.forEach((e)=>{
            const regex = new RegExp(`\\b(${e}[.]([A-z]|[A-z]\\w+))\\b`,'g')
            if(contentRaw.match(regex) !== null)
                {
                    contentRaw = contentRaw.replace(regex,`Content.${e}.$2.url`)
                }
        })
        const condition = (contentRaw.match(RecursiveMatcher.functionName) !== null)
        /**
         * @type {string|Promise<Compiler.remplace>}
         */
        let contentTransform = (condition)? this.replacorForFunctionPromise(contentRaw) : contentRaw;
        let cleanContent;
        if(contentTransform instanceof Promise)
            {   
                cleanContent = await contentTransform.then(async(dataObj)=>{
                    let tempsContent = dataObj.cleanText;
                    totalConstant.forEach((e)=> {
                        const regex = this.regexChangerConst(e)
                        tempsContent = tempsContent.replace(regex,`this.${e}`)
                    });
                    for(const [key,value] of Object.entries(dataObj.data))
                    {
                        const regex = new RegExp(`(?<=(\\bfunction\\b((\\s)+?))(\\b${key}\\b)(((\\s)?)+?)(\\((\\n*?)([^]*)(\\n*?)\\))((\\n*)?))\\{(#&@)\\}`,'g')
                        tempsContent = tempsContent.replace(regex,`\n{${value}}\n`)
                    }
                    return tempsContent;
                    }).catch((err)=>{
                        throw err;
                    })
            } else {
                totalConstant.forEach((e)=>{
                const regex = this.regexChangerConst(e)
                //@ts-ignore
                contentTransform = contentTransform.replace(regex,`this.${e}`)
                })
                cleanContent = contentTransform;
            }
        return cleanContent;
    }

    /**
     * @param {string} pathfile the path file to transform
     * @param {null|string} prefix the path file to transform
     * @param {string} [suffix]
     * @throws Error if is not a path file
     * @return string
     */
    formatName(pathfile,prefix,suffix){
        if (fs.lstatSync(pathfile).isFile())
        {
            pathfile = (path.basename(pathfile).replace(".","_"));
            return (prefix??'') + pathfile.split('.js').join('') + (suffix??'');
        } else {
            throw new Error(`${pathfile} n'est pas un fichier`);
        }
    }
    /**
     * 
     * @param {string[]} arrayClass 
     * @yeild {string} generate iterable of modify class string
     */
    *classModifyGenerator(arrayClass)
    {
        for(let classe of arrayClass)
        {
            const getClassName = classe.match(RecursiveMatcher.ClassName)[0]
            yield `//----|${getClassName}|----\n${classe}\n//&endClass\n`;
        }
    }

    /**
     * @param {string} word 
     * @returns {RegExp}
     */
    regexChangerConst(word)
    {
        return new RegExp(`(?<!((\\_\\_)[A-z]\\w+(\\_\\_\\.)))(((const)((\\s?)+))(\\b${word}\\b)|(\\b${word}\\b))`,'g');
    }

    /**
     * 
     * @param {string} text 
     * @returns {string}
     */
    cleanerCommunJsDeclaration(text){
        if(text.match(this.#regeximportStatementCommunjs) !== null)
        {
            text = text.replace(this.#regeximportStatementCommunjs,'')
        }
        return text;
    }

    /**
     * @param {string} text the text in use to delete every class 
     */
    DeletorForClassPromise(text)
    {
        return new Promise((resolve,reject)=>{
            const values = RecursiveMatcher.getAllClass(text)
            const allClassName = text.match(RecursiveMatcher.ClassName)
            let textWithoutClass = text;
            /**
             * @type {Compiler.rawvalue}
             */
            const rawValueObj = {};
            if(values == null){
                reject(`there are no class to delete in this text (DeletorForClassPromise)`)
            }
            values.forEach((e,index)=>{
                textWithoutClass = textWithoutClass.split(e).join('')
                rawValueObj[allClassName[index]] = e;
            })
            const generateClassModif = this.classModifyGenerator(values)
            resolve(
                {
                data:textWithoutClass,
                value:[...generateClassModif],
                rawValueObj:rawValueObj
            }
            );
        })
    }
    /**
     * @param {string} text the path file to transform 
     * @throws Error if is not a path file
     * @return {Promise<Compiler.remplace>} object of all text to replace the function for 
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
                //@ts-ignore
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
     * @param {*} beginingFile 
     * @param {*} endFile
     * @returns fs.promises is return this one will write in the  fileToReplace directory the replacement.
     */
    lazyRemplacement(beginingFile,endFile){
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile)
        const endBaseName = path.basename(endFile)
        const tRegex = this.regexSectionMaker(endBaseName)
        fs.promises.readFile(beginingFile,{encoding:'utf-8'}).then(async(buffer)=>{
            const textToreplace = buffer.toString()
            let replacingContent = fs.readFileSync(endFile,'utf-8');
            replacingContent = this.cleanerCommunJsDeclaration(replacingContent);   
            let totaltext = textToreplace.replace(tRegex,replacingContent)
            this.setAllConstant(totaltext)
            const optionalNamespace = await this.doubleDeclarationHandler(this.#allConstant,endFile)
            if(optionalNamespace !==null)
            {
                let tempsContent = this.replaceContent(replacingContent,optionalNamespace.double,optionalNamespace.objNameSpace)
                if(replacingContent.match(this.#namespaceObjectRegex) == null)
                {
                    tempsContent = optionalNamespace.data + tempsContent
                }
                totaltext = textToreplace.replace(tRegex,tempsContent)
            }
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`))
            //@ts-ignore
            return fs.promises.writeFile(beginingFile,this.removeAllBlank(totaltext))
        })
    }

    /**
     * @param {string} beginingFile the begining file (file who's replace)
     * @param {string} endFile the End file  (file take to replace the begining file)
     * @returns fs.promises is return this one will write in the  fileToReplace directory the replacement.
     */
    async lazyComposerRemplacement(beginingFile,endFile){
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile)
        const endBaseName = path.basename(endFile)
        fs.promises.readFile(beginingFile,{encoding:'utf-8'}).then(async (buffer)=>{
            const tRegex = this.regexSectionMaker(endBaseName);
            let textToreplace = buffer.toString();
            let raw = fs.readFileSync(endFile,'utf-8');
            let totalClass;
            const condition = (raw.match(RecursiveMatcher.ClassStart) !== null)
            let replacingContent = (condition)? await this.DeletorForClassPromise(raw).then((dataObj)=>{
                totalClass = dataObj.rawValueObj;
                return dataObj.data
            }):raw;
            //--------------endfile---------------------
            const allClassContent = RecursiveMatcher.getSpecificClassContent(textToreplace,'Content')[0]
            replacingContent = this.cleanerCommunJsDeclaration(replacingContent);
            const totalClassContent = allClassContent.replace(tRegex,replacingContent);
            const totalClassDeclaration = this.getClassDeclaration(RecursiveMatcher.contentCleanerRecursion(totalClassContent))
            const inClassDeclaration = Object.values(totalClassDeclaration).flat().filter(e=>e!=null);
            const optionalNamespace = await this.doubleDeclarationHandler(inClassDeclaration,endFile)
            if(optionalNamespace !==null)
            {
                replacingContent = this.replaceContent(replacingContent,optionalNamespace.double,optionalNamespace.objNameSpace)
                replacingContent = optionalNamespace.data + replacingContent
                console.log(
                    chalk.bgYellow(chalk.black(`A nameSpaceObject has been made in file:(${path.basename(endFile)}) due to multiple same name constant declaration`),
                    chalk.black(`\nyou must use ${optionalNamespace.objNameSpace}.(${optionalNamespace.double}) for reference in other file`)
                ));
                inClassDeclaration.push(optionalNamespace.objNameSpace)
            }
            const getAsset = this.getAssetPathConst()
            replacingContent = await this.ContentCleaner(replacingContent,inClassDeclaration,Object.keys(getAsset));
            //--------------beginingfile---------------------
            if(typeof totalClass != 'undefined')
            {
                for(const [key,value] of Object.entries(totalClass)){
                    const regexsection = this.regexSectionMakerForClass(key)
                    textToreplace = textToreplace.replace(regexsection,value)
                }
            }
            let totaltext = textToreplace.replace(tRegex,replacingContent)
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`))
            //@ts-ignore
            return fs.promises.writeFile(beginingFile,this.removeAllBlank(totaltext))
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
        return new RegExp(`((?<=(\\/\\/----)[\\|](${toSection}).*\n))(.+?)(?=((\\/\\/&end)\\b))`, "s");
    }
    /**
     * 
     * @param {string} toSection 
     * @return make a regex to Cut a section in some text 
     * @example section must be like this :
        ```
        ...
        //----|loader.js|----
        const loader = new THREE.TextureLoader();//only this space will be capture
        //&endClass
        ...
        ```
     */
    regexSectionMakerForClass(toSection)
    {
        return new RegExp(`((?<=(\\/\\/----)[\\|](${toSection}).*\n))(.+?)(?=((\\/\\/&endClass)\\b))`,"s")
    }
    /**
     * @public allows to complete the public/versioning/compiling.js folder automatically
        it waits for the promise compilerContentPromise() to return what is needed according to the given situation (in a macOS enviroment the 'repolulate' 
     * fonction might trigget 2 time when it's watched because of the pre-programming enviroment work that way)  
     * @param {string} file
     * @param {boolean} composerContext 
     * @returns {Promise<void>} 
     * 
     */
    async repopulateComposer(file,composerContext=true)
    {
        await this.compilerContentPromise(this.fileDirArray,'composer')
        .then((data)=>{
            if(fs.existsSync(file))
            {
                fs.promises.readFile(file,{encoding:'utf-8'}).then(async (buffer)=>{
                    const contentFile = buffer.toString()
                    if(data != contentFile)
                    {
                        return fs.promises.writeFile(file,this.removeAllBlank(data))
                    }
                })
            } else {
                fs.appendFileSync(file,this.removeAllBlank(data))
            }
        (composerContext)?console.log(chalk.green(`fichier compiler mise à jour ${new Date(Date.now()).toString()}`)):'';
        })
        .catch((err)=>{
            console.log(`${err}\n${new Date(Date.now()).toString()}`)
        })
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
     * @param {string} file 
     * @param {boolean} composerContext 
     */
    async repopulatelinkFile(file,composerContext=true)
    {
            await this.compilerContentPromise(this.fileDirArray.slice(1,this.fileDirArray.length-1),'linkfile')
            .then((data)=>{
                this.setAllConstant(data)
                if(fs.existsSync(file))
                    {
                        fs.promises.readFile(file,{encoding:'utf-8'}).then(async (buffer)=>{
                            const contentFile = buffer.toString()
                            if(data != contentFile)
                            {
                                return fs.promises.writeFile(file,this.removeAllBlank(data))
                            }
                        })
                    } else {
                        fs.appendFileSync(file,data)
                    }
                    (composerContext)?console.log(chalk.green(`fichier linkfile mise à jour ${new Date(Date.now()).toString()}`)):'';
            })
            // .catch((err)=>{

            //     console.log(chalk.red(`${err} \n${new Date(Date.now()).toString()}`))
            // })
    }

    /**
     * @param {string} text
     */
    removeAllBlank(text){
        return text.replace(this.#regexremoveBlank,'\n')
    }

    /*
    français:
        trouve toute les constant a exporté plus tard 
    French:
        find all the constants to export later
    */
    
    /**
     * @public find all the constants to export later
     * @param {string} content get all the content of the export name;
     * @returns {string[]} 
     */
    getAllExportName(content)
    {
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
        const basenameFile = path.basename(file);

        if(!['configImport.js','resizeSetting.js'].includes(basenameFile))
        {
            fs.promises.readFile(file,{encoding:'utf-8'}).then(async(buffer)=>{
                const content = buffer.toString()
                if(content.match(this.#regeximportStatementCommunjs) == null)
                {
                    const text = this.getImportStript() + content
                    console.log(chalk.green(`the import statement as been added to '${path.basename(file)}'`))
                    return fs.promises.writeFile(file,text)
                }
            }) 
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
     * @returns {string} void
     */
    getImportStript(jumpLine=true){
        let importScript = 'const { '
        for(let index in this.#allConstant)
        {
            importScript += `${this.#allConstant[index]},`
            importScript += (parseInt(index)%3 == 0)? '\n\t' :' ' ;
        } 
        importScript+= `} = require('../../public/versionning/linkFile.js')`
        importScript+=(jumpLine)?'\n':'';
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
        /**
         * @type {Compiler.rawvalueContainer}
         */
        const content = {}
        
        for(const [key, value] of this.mapAsset)
            {
                /**
                 * @type {Compiler.rawvalue}
                 */
                const subContent = {}
                if(key === 'img')
                {
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

        const configFile = PathUtility.getPathFromElement(this.#compilerDir,'compile_param.json')  
        const contentConfig = fs.readFileSync(configFile,'utf-8')
        const json = JSON.parse(contentConfig)
        const elementDict = {}
        return json.dependencies;
    }

    /*
    français:
        formate un script CommunJs en partant de la base du dossier configImport.js(qui lui est en module-es)
        utilsant l'importation comme moyen d'accédés au module externe ajouté tel que three, ou canon-es par exemple.        
    */ 
    /**
     * @public formats a CommunJs script starting from the base of the configImport.js folder (which is in module-es)
        using the import as a means of accessing the added external module such as three, or canon-es for example.ƒ
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

    getImportEsmScript()
    {
        let content = ''
        const configUtility = this.getConfigUtilty()
        for(const [key,value] of Object.entries(configUtility))
        {
            switch (value?.type){
                case 'default' : 
                    content += `\nimport * as ${key} from '${value?.src ?? value}' \n`
                break;
                case 'multi' : 
                    content += `\nimport {${(value?.keys).join(',') ?? key}} from '${value?.src ?? value}' \n`
                break;
                default: content += `\nimport ${key} from '${value?.src ?? value}' \n`;
                break;
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
     * @param {string[]} arrayFile array of file already sorted
     * @param {string} [typedata] array of file already sorted
     * @returns {Promise<string>} promise
     */
    compilerContentPromise(arrayFile,typedata) 
    {
        return new Promise((resolve,reject)=>
            {
                setTimeout(()=>{
                    reject("la compilation des donnée à pris trop de temps");
                },3000)
                if(typedata == 'linkfile')
                {
                    resolve(this.getContentFile(arrayFile))

                } else if(typedata == 'composer'){
                    resolve(this.getComposerContent(arrayFile))
                } else {
                    reject(`typedata: ${typedata} non reconnu `)
                }
            },)
    }

    /**
     * 
     * @param {Error} err 
     * @param {*} data 
     * @throw {Error}
     * 
     */
    #jsonParser(err,data)
    {
        if (err) {
            throw err;
        } else {
            console.log(JSON.parse(data))
        }
    }

}
