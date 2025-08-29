var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Compile_matchregexVariableDeclaration, _Compile_commentRemover, _Compile_matchregexConstantDelcaration, _Compile_matchparamDeclaration, _Compile_regeximportStatementCommunjs, _Compile_namespaceObjectRegex, _Compile_getfunctionName, _Compile_regexDeclaration, _Compile_regexpathimport, _Compile_regexremoveBlank, _Compile_allConstant, _Compile_compilerDir;
import chalk from 'chalk';
import path, { basename } from 'path';
import fs from 'fs';
import RecursiveMatcher from './RecursiveMatcher.js';
import PathUtility from './pathUtility.js';
class Compile {
    constructor(compilerDir) {
        _Compile_matchregexVariableDeclaration.set(this, /(?<=(\blet\b)(\s+))(([A-z]|[A-z]\w+)*)/g);
        _Compile_commentRemover.set(this, /((\/\/).+|(\/[*](.*\n)+[*]\/))/g);
        _Compile_matchregexConstantDelcaration.set(this, /(?<=\b(const(\s)+?)\b)(([A-z]|[A-z0-9]+)*)/g);
        _Compile_matchparamDeclaration.set(this, /(?<=(\bthis[.]\b))((([A-z])|[A-z]\w+)*)(?=((\s?)+?)[=])/g);
        _Compile_regeximportStatementCommunjs.set(this, /(((\bconst\b)|(\blet\b))((([\s]+)?)((\{([\s\S]?)+\})|.*)([\s]+)[=]([\s]+)|))?(\brequire\b)\(([\'\"].*[\'\"])\)(\.\w+)?\;?/g);
        _Compile_namespaceObjectRegex.set(this, /(\bconst\b)(\s?)+(((\_\_)([A-z]|[A-z]\w+)(\_\_)))(\s?)+(\=)(\s?)+(\{(\s?)+\})/g);
        _Compile_getfunctionName.set(this, /(?<=(\b(\t?)function\b((\s)+?)))(([A-z])|([A-z]\w+))(?=(((\s)?)+?)(\((\n*?)([^]*)(\n*?)\))((\n*)?)\{)/g);
        _Compile_regexDeclaration.set(this, /(?:(?=(?<=import.{.))[A-z,]*|(?!import.{.)((?<=import.*.as.)[A-z]\w+))/g);
        _Compile_regexpathimport.set(this, /(?<=from.(\'|\"))[A-z/.-]*/g);
        _Compile_regexremoveBlank.set(this, /(\n\s)/g);
        _Compile_allConstant.set(this, []);
        _Compile_compilerDir.set(this, void 0);
        let fileDirArray = PathUtility.getarrayFile(compilerDir);
        this.fileDirArray = this.setMapFile(fileDirArray);
        this.mapAsset = PathUtility.getMapAsset();
        __classPrivateFieldSet(this, _Compile_compilerDir, compilerDir, "f");
    }
    setAllConstant(text) {
        const objectmatchDelcaration = this.getTotaldeclaration(RecursiveMatcher.contentCleanerRecursion(text));
        __classPrivateFieldSet(this, _Compile_allConstant, Object.values(objectmatchDelcaration).flat().filter(e => e != null) ?? [], "f");
    }
    addToAllConstant(...array) {
        __classPrivateFieldSet(this, _Compile_allConstant, __classPrivateFieldGet(this, _Compile_allConstant, "f")?.concat(array) ?? array, "f");
    }
    getfileDirarraySlice(start, end) {
        return this.fileDirArray.slice(start, end);
    }
    get allConstant() {
        return __classPrivateFieldGet(this, _Compile_allConstant, "f");
    }
    setMapFile(fileArray) {
        let ii = 1;
        const organisedArray = [];
        const iterator = fileArray.map((value) => {
            let base = path?.basename(value);
            return [base, value];
        })[Symbol.iterator]();
        for (let [base, full] of iterator) {
            switch (true) {
                case /(renderersetting)/gi.test(base):
                    organisedArray[0] = full;
                    break;
                case /(camerasetting)/gi.test(base):
                    organisedArray[1] = full;
                    break;
                case /(loader)/gi.test(base):
                    organisedArray[2] = full;
                    break;
                case /(animate)/gi.test(base):
                    organisedArray[fileArray.length - 2] = full;
                    break;
                case /(resizeSetting)/gi.test(base):
                    organisedArray[fileArray.length - 1] = full;
                    break;
                case undefined: break;
                default:
                    organisedArray[2 + ii] = full;
                    ii++;
                    break;
            }
        }
        return organisedArray;
    }
    replaceContent(text, arrayWord, objNameSpace) {
        for (const word of arrayWord) {
            const regex = this.regexChangerConst(word);
            text = text.replace(regex, `${objNameSpace}.${word}`);
        }
        return text;
    }
    nameSpaceMaker(file) {
        const formatName = this.formatName(file, '__', '__');
        let content = `const ${formatName} = {}\n`;
        return content;
    }
    checkdouble(array) {
        const uniqueArray = [...new Set(array)];
        let i = 0;
        const condition = (array.length != uniqueArray.length);
        const double = (condition) ? array.filter((e) => {
            if (e != uniqueArray[i]) {
                return e;
            }
            else {
                i++;
            }
        }) : null;
        return {
            double: double,
            uniqueArray: uniqueArray
        };
    }
    getTotaldeclaration(text) {
        const allVariable = text.match(__classPrivateFieldGet(this, _Compile_matchregexVariableDeclaration, "f"));
        const allVariablewordConst = text.match(__classPrivateFieldGet(this, _Compile_matchregexConstantDelcaration, "f"));
        const allFunctionName = text.match(RecursiveMatcher.functionName);
        const allClassName = text.match(RecursiveMatcher.ClassName);
        return {
            variableDeclaration: allVariable,
            constant: allVariablewordConst,
            functionName: allFunctionName,
            allClassName: allClassName
        };
    }
    getClassDeclaration(text) {
        const allVariablewordConst = text.match(__classPrivateFieldGet(this, _Compile_matchregexConstantDelcaration, "f"));
        const matchparamDeclaration = text.match(__classPrivateFieldGet(this, _Compile_matchparamDeclaration, "f"));
        return {
            paramClass: matchparamDeclaration,
            constant: allVariablewordConst,
        };
    }
    async getContentFile(fileArray) {
        let compiledContent = `${this.getImportCommunJsScript()}\n`;
        const getAsset = this.getAssetPathConst();
        for (let [key, values] of Object.entries(getAsset)) {
            compiledContent += `const ${key} = {\n`;
            for (let [key, value] of Object.entries(values)) {
                compiledContent += `${key}:'${value}',\n`;
            }
            compiledContent += `\n}\n`;
        }
        let totalDeclaration = [];
        for (let i = 0; i < fileArray.length; i++) {
            if (fileArray[i] !== undefined) {
                let content = fs.readFileSync(fileArray[i], 'utf-8');
                content = this.cleanerCommunJsDeclaration(content);
                const DeclarationObject = this.getTotaldeclaration(RecursiveMatcher.contentCleanerRecursion(content));
                const allMatchedDecaration = Object.values(DeclarationObject).flat().filter(e => e != null);
                totalDeclaration = totalDeclaration?.concat(allMatchedDecaration) ?? [];
                const optionalNamespace = await this.doubleDeclarationHandler(totalDeclaration, fileArray[i]);
                if (optionalNamespace != null) {
                    let cleanContent = this.replaceContent(content, optionalNamespace.double, optionalNamespace.objNameSpace);
                    content = optionalNamespace.data + cleanContent;
                    totalDeclaration = optionalNamespace.clean;
                }
                compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content}\n//&end\n`;
            }
        }
        compiledContent += this.getExportScript(this.getAllExportName(compiledContent));
        return compiledContent.trim();
    }
    ObjectNamespaceMakerPromise(array, file) {
        return new Promise((resolve, reject) => {
            if (array == null) {
                resolve(null);
            }
            reject(this.nameSpaceMaker(file));
        });
    }
    async doubleDeclarationHandler(array, file) {
        const { double, uniqueArray } = this.checkdouble(array);
        const ObjectMakerPromise = this.ObjectNamespaceMakerPromise(double, file);
        let objectNamespaceContent;
        await ObjectMakerPromise.then((data) => {
            objectNamespaceContent = data;
        })
            .catch((dataErr) => {
            const namespaceKey = this.formatName(file, '__', '__');
            objectNamespaceContent = {
                double: double,
                data: dataErr,
                clean: uniqueArray,
                objNameSpace: namespaceKey,
            };
        }).finally(() => {
            return objectNamespaceContent;
        });
        return objectNamespaceContent;
    }
    async getComposerContent(fileArray) {
        let compiledContent = "import { ImageCache,ImagesCacheHandler } from '../../../_types/app/model/cache/cacheImageUtility.js'";
        compiledContent += this.getImportEsmScript();
        compiledContent += '//----|Class_Content|----\n//No Class\n//&end';
        compiledContent += '\nclass Content {\n';
        const getAsset = this.getAssetPathConst();
        for (let [key, values] of Object.entries(getAsset)) {
            compiledContent += `static ${key} = {\n`;
            for (let [key, value] of Object.entries(values)) {
                compiledContent += `${key}:new ImageCache('${value}'),\n`;
            }
            compiledContent += `\n}\n`;
        }
        compiledContent += `constructor(){\n`;
        for (let i = 0; i < fileArray.length; i++) {
            const namefile = this.formatName(fileArray[i], 'file_');
            compiledContent += `\nthis.${namefile}()`;
        }
        compiledContent += '\n}\n';
        let totalConstant = [];
        let totalClass = '';
        for (let i = 0; i < fileArray.length; i++) {
            const Raw = fs.readFileSync(fileArray[i], 'utf-8');
            const condition = (Raw.match(RecursiveMatcher.ClassStart) !== null);
            const contentRaw = (condition) ? await this.DeletorForClassPromise(Raw).then((dataObj) => {
                totalClass += dataObj.value.join('\n');
                return dataObj.data;
            }) : Raw;
            const namefile = this.formatName(fileArray[i], 'file_');
            let content = this.cleanerCommunJsDeclaration(contentRaw);
            if (fileArray[i] !== undefined) {
                const declarationObject = this.getTotaldeclaration(RecursiveMatcher.contentCleanerRecursion(content));
                const allMatchedDecaration = Object.values(declarationObject).flat().filter(e => e != null);
                totalConstant = totalConstant?.concat((declarationObject.constant ?? [])) ?? [];
                const optionalNamespace = await this.doubleDeclarationHandler(totalConstant, fileArray[i]);
                if (optionalNamespace != null) {
                    let contentNameSpaced = this.replaceContent(content, optionalNamespace.double, optionalNamespace.objNameSpace);
                    content = optionalNamespace.data + contentNameSpaced;
                    totalConstant = optionalNamespace.clean;
                    totalConstant.push(optionalNamespace.objNameSpace);
                    console.log(chalk.bgYellow(chalk.black(`A nameSpaceObject has been made in file:(${path.basename(fileArray[i])}) due to multiple same name constant declaration`), chalk.black(`\nyou must use ${optionalNamespace.objNameSpace}.(${optionalNamespace.double}) for reference in other file`), '\n'));
                }
                const cleanContent = await this.ContentCleaner(content, totalConstant, Object.keys(getAsset));
                content = `${cleanContent}\n//&end\n`;
            }
            compiledContent += `${namefile}(){\n//----|${path.basename(fileArray[i])}|----\n${content}\n}\n`;
        }
        compiledContent = this.cleanerCommunJsDeclaration(compiledContent);
        compiledContent += '\n}\n';
        compiledContent += `\ndocument.addEventListener('DOMContentLoaded', async() => {\n\tnew Content()\n\tawait ImagesCacheHandler.saveNameToLocalStorage()\n});\n `;
        const tregex = this.regexSectionMaker('Class_Content');
        compiledContent = compiledContent.replace(tregex, totalClass);
        return compiledContent.trim();
    }
    async ContentCleaner(contentRaw, totalConstant, asset) {
        asset.forEach((e) => {
            const regex = new RegExp(`\\b(${e}[.]([A-z]|[A-z]\\w+))\\b`, 'g');
            if (contentRaw.match(regex) !== null) {
                contentRaw = contentRaw.replace(regex, `Content.${e}.$2.url`);
            }
        });
        const condition = (contentRaw.match(RecursiveMatcher.functionName) !== null);
        let contentTransform = (condition) ? this.replacorForFunctionPromise(contentRaw) : contentRaw;
        let cleanContent;
        if (contentTransform instanceof Promise) {
            cleanContent = await contentTransform.then(async (dataObj) => {
                let tempsContent = dataObj.cleanText;
                totalConstant.forEach((e) => {
                    const regex = this.regexChangerConst(e);
                    tempsContent = tempsContent.replace(regex, `this.${e}`);
                });
                for (const [key, value] of Object.entries(dataObj.data)) {
                    const regex = new RegExp(`(?<=(\\bfunction\\b((\\s)+?))(\\b${key}\\b)(((\\s)?)+?)(\\((\\n*?)([^]*)(\\n*?)\\))((\\n*)?))\\{(#&@)\\}`, 'g');
                    tempsContent = tempsContent.replace(regex, `\n{${value}}\n`);
                }
                return tempsContent;
            }).catch((err) => {
                throw err;
            });
        }
        else {
            totalConstant.forEach((e) => {
                const regex = this.regexChangerConst(e);
                contentTransform = contentTransform.replace(regex, `this.${e}`);
            });
            cleanContent = contentTransform;
        }
        return cleanContent;
    }
    formatName(pathfile, prefix, suffix) {
        if (fs.lstatSync(pathfile).isFile()) {
            pathfile = path.basename(pathfile).split(".").join("").replace(/(c?js)/g, "");
            return (prefix ?? '') + pathfile.replace(/[0-9]+/g, "") + (suffix ?? '');
        }
        else {
            throw new Error(`${pathfile} n'est pas un fichier`);
        }
    }
    *classModifyGenerator(arrayClass) {
        for (let classe of arrayClass) {
            const getClassName = classe.match(RecursiveMatcher.ClassName)[0];
            yield `//----|${getClassName}|----\n${classe}\n//&endClass\n`;
        }
    }
    regexChangerConst(word) {
        return new RegExp(`(?<!((\\_\\_)[A-z]\\w+(\\_\\_\\.)))(((const)((\\s?)+))(\\b${word}\\b)|(\\b${word}\\b))`, 'g');
    }
    cleanerCommunJsDeclaration(text) {
        if (__classPrivateFieldGet(this, _Compile_regeximportStatementCommunjs, "f").test(text)) {
            text = text.replace(__classPrivateFieldGet(this, _Compile_regeximportStatementCommunjs, "f"), '');
        }
        return text;
    }
    DeletorForClassPromise(text) {
        return new Promise((resolve, reject) => {
            const values = RecursiveMatcher.getAllClass(text);
            const allClassName = text.match(RecursiveMatcher.ClassName);
            let textWithoutClass = text;
            const rawValueObj = {};
            if (values == null) {
                reject(`there are no class to delete in this text (DeletorForClassPromise)`);
            }
            values.forEach((e, index) => {
                textWithoutClass = textWithoutClass.split(e).join('');
                rawValueObj[allClassName[index]] = e;
            });
            const generateClassModif = this.classModifyGenerator(values);
            resolve({
                data: textWithoutClass,
                value: [...generateClassModif],
                rawValueObj: rawValueObj
            });
        });
    }
    replacorForFunctionPromise(text) {
        return new Promise((resolve, reject) => {
            let ObjectToChange = {};
            const values = RecursiveMatcher.getAllFunctionContent(text);
            let textWithoutFunc = text;
            values.forEach((e) => {
                textWithoutFunc = textWithoutFunc.replace(e, '#&@');
            });
            const keys = textWithoutFunc.match(__classPrivateFieldGet(this, _Compile_getfunctionName, "f"));
            if ((values == null) || (keys == null)) {
                reject(`no value or keys matched value:${values} keys:${keys}`);
            }
            if (values.length != keys.length) {
                reject('error matching the key and the value doesn\'t have the same length');
            }
            for (let i = 0; i < values.length; i++) {
                ObjectToChange[keys[i]] = values[i];
            }
            resolve({
                data: ObjectToChange,
                cleanText: textWithoutFunc
            });
        });
    }
    lazyRemplacement(beginingFile, endFile) {
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile);
        const endBaseName = path.basename(endFile);
        const tRegex = this.regexSectionMaker(endBaseName);
        fs.promises.readFile(beginingFile, { encoding: 'utf-8' }).then(async (buffer) => {
            const textToreplace = buffer.toString();
            let replacingContent = fs.readFileSync(endFile, 'utf-8');
            replacingContent = this.cleanerCommunJsDeclaration(replacingContent);
            let totaltext = textToreplace.replace(tRegex, replacingContent);
            this.setAllConstant(totaltext);
            const optionalNamespace = await this.doubleDeclarationHandler(__classPrivateFieldGet(this, _Compile_allConstant, "f"), endFile);
            if (optionalNamespace !== null) {
                let tempsContent = this.replaceContent(replacingContent, optionalNamespace.double, optionalNamespace.objNameSpace);
                if (replacingContent.match(__classPrivateFieldGet(this, _Compile_namespaceObjectRegex, "f")) == null) {
                    tempsContent = optionalNamespace.data + tempsContent;
                }
                totaltext = textToreplace.replace(tRegex, tempsContent);
            }
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`));
            return fs.promises.writeFile(beginingFile, this.removeAllBlank(totaltext));
        });
    }
    async lazyComposerRemplacement(beginingFile, endFile) {
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile);
        const endBaseName = path.basename(endFile);
        fs.promises.readFile(beginingFile, { encoding: 'utf-8' }).then(async (buffer) => {
            const tRegex = this.regexSectionMaker(endBaseName);
            let textToreplace = buffer.toString();
            let raw = fs.readFileSync(endFile, 'utf-8');
            let totalClass;
            const condition = (raw.match(RecursiveMatcher.ClassStart) !== null);
            let replacingContent = (condition) ? await this.DeletorForClassPromise(raw).then((dataObj) => {
                totalClass = dataObj.rawValueObj;
                return dataObj.data;
            }) : raw;
            const allClassContent = RecursiveMatcher.getSpecificClassContent(textToreplace, 'Content')[0];
            replacingContent = this.cleanerCommunJsDeclaration(replacingContent);
            const totalClassContent = allClassContent.replace(tRegex, replacingContent);
            const totalClassDeclaration = this.getClassDeclaration(RecursiveMatcher.contentCleanerRecursion(totalClassContent));
            const inClassDeclaration = Object.values(totalClassDeclaration).flat().filter(e => e != null);
            const optionalNamespace = await this.doubleDeclarationHandler(inClassDeclaration, endFile);
            if (optionalNamespace !== null) {
                replacingContent = this.replaceContent(replacingContent, optionalNamespace.double, optionalNamespace.objNameSpace);
                replacingContent = optionalNamespace.data + replacingContent;
                console.log(chalk.bgYellow(chalk.black(`A nameSpaceObject has been made in file:(${path.basename(endFile)}) due to multiple same name constant declaration`), chalk.black(`\nyou must use ${optionalNamespace.objNameSpace}.(${optionalNamespace.double}) for reference in other file`)));
                inClassDeclaration.push(optionalNamespace.objNameSpace);
            }
            const getAsset = this.getAssetPathConst();
            replacingContent = await this.ContentCleaner(replacingContent, inClassDeclaration, Object.keys(getAsset));
            if (typeof totalClass != 'undefined') {
                for (const [key, value] of Object.entries(totalClass)) {
                    const regexsection = this.regexSectionMakerForClass(key);
                    textToreplace = textToreplace.replace(regexsection, value);
                }
            }
            let totaltext = textToreplace.replace(tRegex, replacingContent);
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`));
            return fs.promises.writeFile(beginingFile, this.removeAllBlank(totaltext));
        });
    }
    regexSectionMaker(toSection) {
        return new RegExp(`((?<=(\\/\\/----)[\\|](${toSection}).*\n))(.+?)(?=((\\/\\/&end)\\b))`, "s");
    }
    regexSectionMakerForClass(toSection) {
        return new RegExp(`((?<=(\\/\\/----)[\\|](${toSection}).*\n))(.+?)(?=((\\/\\/&endClass)\\b))`, "s");
    }
    async repopulateComposer(file, composerContext = true) {
        await this.compilerContentPromise(this.fileDirArray, 'composer')
            .then((data) => {
            if (fs.existsSync(file)) {
                fs.promises.readFile(file, { encoding: 'utf-8' }).then(async (buffer) => {
                    const contentFile = buffer.toString();
                    if (data != contentFile) {
                        return fs.promises.writeFile(file, this.removeAllBlank(data));
                    }
                });
            }
            else {
                fs.appendFileSync(file, this.removeAllBlank(data));
            }
            (composerContext) ? console.log(chalk.green(`fichier compiler mise à jour ${new Date(Date.now()).toString()} for scene : "${__classPrivateFieldGet(this, _Compile_compilerDir, "f")}"`)) : '';
        })
            .catch((err) => {
            console.log(`${err}\n${new Date(Date.now()).toString()}`);
        });
    }
    async repopulatelinkFile(file, composerContext = true) {
        await this.compilerContentPromise(this.fileDirArray, 'linkfile')
            .then((data) => {
            this.setAllConstant(data);
            if (fs.existsSync(file)) {
                fs.promises.readFile(file, { encoding: 'utf-8' }).then(async (buffer) => {
                    const contentFile = buffer.toString();
                    if (data != contentFile) {
                        return fs.promises.writeFile(file, this.removeAllBlank(data));
                    }
                });
            }
            else {
                fs.appendFileSync(file, data);
            }
            (composerContext) ? console.log(chalk.green(`fichier linkfile mise à jour ${new Date(Date.now()).toString()} for scene : "${__classPrivateFieldGet(this, _Compile_compilerDir, "f")}"`)) : '';
        });
    }
    removeAllBlank(text) {
        return text.replace(__classPrivateFieldGet(this, _Compile_regexremoveBlank, "f"), '\n');
    }
    getAllExportName(content) {
        const alltheFunction = RecursiveMatcher.getAllFunctionContent(content);
        if (alltheFunction !== null) {
            alltheFunction.forEach((e) => {
                content = content.replace(e, '');
            });
        }
        let arrayDeclaration = this.getTotaldeclaration(content).constant;
        arrayDeclaration = content.match(__classPrivateFieldGet(this, _Compile_getfunctionName, "f"))?.concat(arrayDeclaration) ?? arrayDeclaration;
        return arrayDeclaration;
    }
    addimportScript(file) {
        const basenameFile = path.basename(file);
        if (!['configImport.js', 'resizeSetting.js'].includes(basenameFile)) {
            fs.promises.readFile(file, { encoding: 'utf-8' }).then(async (buffer) => {
                const content = buffer.toString();
                if (content.match(__classPrivateFieldGet(this, _Compile_regeximportStatementCommunjs, "f")) == null) {
                    const text = this.getImportStript() + content;
                    console.log(chalk.green(`the import statement as been added to '${path.basename(file)}'`));
                    return fs.promises.writeFile(file, text);
                }
            });
        }
    }
    getExportScript(constArray) {
        let exportsScript = '';
        for (const [key, value] of Object.entries(this.getConfigUtilty())) {
            if (!key.includes(",")) {
                exportsScript += `globalThis.${key} = ${key}\n`;
            }
            else {
                const alldeclaration = key.split(',');
                alldeclaration.forEach((element) => {
                    exportsScript += `globalThis.${__classPrivateFieldGet(this, _Compile_compilerDir, "f")}.${element} = ${element}\n`;
                });
            }
        }
        for (let i = 0; i < constArray.length; i++) {
            exportsScript += `globalThis.${constArray[i]} = ${constArray[i]}\n`;
        }
        return exportsScript;
    }
    getImportStript(jumpLine = true) {
        let importScript = 'const { ';
        for (let index in __classPrivateFieldGet(this, _Compile_allConstant, "f")) {
            importScript += `${__classPrivateFieldGet(this, _Compile_allConstant, "f")[index]},`;
            importScript += (parseInt(index) % 3 == 0) ? '\n\t' : ' ';
        }
        importScript += `} = require('../../public/versionning/linkFile.js')`;
        importScript += (jumpLine) ? '\n' : '';
        return importScript;
    }
    getAssetPathConst() {
        const content = {};
        for (const [key, value] of this.mapAsset) {
            const subContent = {};
            if (key === 'img') {
                for (const file of value) {
                    if (path.basename(file).includes('.png')) {
                        subContent[path.basename(file, '.png')] = path.join('asset', 'img', file);
                    }
                    else if (path.basename(file).includes('.jpg')) {
                        subContent[path.basename(file, '.jpg')] = path.join('asset', 'img', file);
                    }
                }
                ;
            }
            else {
                for (const file of value) {
                    subContent[path.basename(file, `.${key}`)] = path.join('asset', key, file);
                }
            }
            content[key] = subContent;
        }
        return content;
    }
    getConfigUtilty() {
        const configFile = PathUtility.getPathFromElement(__classPrivateFieldGet(this, _Compile_compilerDir, "f"), 'compile_param.json');
        const contentConfig = fs.readFileSync(configFile, 'utf-8');
        const json = JSON.parse(contentConfig);
        return json.dependencies;
    }
    getImportCommunJsScript() {
        let content = '';
        const configUtility = this.getConfigUtilty();
        for (const [key, value] of Object.entries(configUtility)) {
            switch (value?.type) {
                case 'multi':
                    content += `\nconst {${(value?.keys)?.join(',') ?? key}} = require('${value?.src ?? value}')\n`;
                    break;
                case 'default':
                default:
                    content += `\nconst ${(value?.keys)?.join(',') ?? key} = require('${value?.src ?? value}')\n`;
                    break;
            }
        }
        return content;
    }
    getImportEsmScript() {
        let content = '';
        const configUtility = this.getConfigUtilty();
        for (const [key, value] of Object.entries(configUtility)) {
            switch (value?.type) {
                case 'multi':
                    content += `\nimport {${(value?.keys)?.join(',') ?? key}} from '${value?.src ?? value}' \n`;
                    break;
                case 'default':
                    content += `\nimport * as ${key} from '${value?.src ?? value}' \n`;
                    break;
                default:
                    content += `\nimport ${key} from '${value?.src ?? value}' \n`;
                    break;
            }
        }
        return content;
    }
    compilerContentPromise(arrayFile, typedata) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("la compilation des donnée à pris trop de temps");
            }, 3000);
            if (typedata == 'linkfile') {
                resolve(this.getContentFile(arrayFile));
            }
            else if (typedata == 'composer') {
                resolve(this.getComposerContent(arrayFile));
            }
            else {
                reject(`typedata: ${typedata} non reconnu `);
            }
        });
    }
}
_Compile_matchregexVariableDeclaration = new WeakMap(), _Compile_commentRemover = new WeakMap(), _Compile_matchregexConstantDelcaration = new WeakMap(), _Compile_matchparamDeclaration = new WeakMap(), _Compile_regeximportStatementCommunjs = new WeakMap(), _Compile_namespaceObjectRegex = new WeakMap(), _Compile_getfunctionName = new WeakMap(), _Compile_regexDeclaration = new WeakMap(), _Compile_regexpathimport = new WeakMap(), _Compile_regexremoveBlank = new WeakMap(), _Compile_allConstant = new WeakMap(), _Compile_compilerDir = new WeakMap();
export default Compile;
