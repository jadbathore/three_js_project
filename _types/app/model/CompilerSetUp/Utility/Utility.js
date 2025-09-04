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
var _Compile_instances, _Compile_matchregexVariableDeclaration, _Compile_commentRemover, _Compile_matchregexConstantDelcaration, _Compile_matchparamDeclaration, _Compile_regeximportStatementCommunjs, _Compile_namespaceObjectRegex, _Compile_getfunctionName, _Compile_regexDeclaration, _Compile_regexpathimport, _Compile_regexremoveBlank, _Compile_allConstant, _Compile_compilerDir, _Compile_setAllConstant, _Compile_addToAllConstant, _Compile_getfileDirarraySlice, _Compile_replaceContent, _Compile_checkdouble, _Compile_getTotaldeclaration, _Compile_getClassDeclaration, _Compile_getContentFile, _Compile_objectNamespaceMakerPromise, _Compile_doubleDeclarationHandler, _Compile_getComposerContent, _Compile_contentCleaner, _Compile_formatName, _Compile_classModifyGenerator, _Compile_regexChangerConst, _Compile_cleanerCommunJsDeclaration, _Compile_deletorForClassPromise, _Compile_replacorForFunctionPromise, _Compile_regexSectionMaker, _Compile_regexSectionMakerForClass, _Compile_removeAllBlank, _Compile_getAllExportName, _Compile_getExportScript, _Compile_getImportStript, _Compile_getAssetPathConst, _Compile_getConfigUtilty, _Compile_getImportCommunJsScript, _Compile_getImportEsmScript, _Compile_compilerContentPromise;
import chalk from 'chalk';
import path, { basename } from 'path';
import fs from 'fs';
import RecursiveMatcher from './RecursiveMatcher.js';
import PathUtility from './pathUtility.js';
class Compile {
    constructor(compilerDir) {
        _Compile_instances.add(this);
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
    nameSpaceMaker(file) {
        const formatName = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_formatName).call(this, file, '__', '__');
        let content = `const ${formatName} = {}\n`;
        return content;
    }
    lazyRemplacement(beginingFile, endFile) {
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile);
        const endBaseName = path.basename(endFile);
        const tRegex = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexSectionMaker).call(this, endBaseName);
        fs.promises.readFile(beginingFile, { encoding: 'utf-8' }).then(async (buffer) => {
            const textToreplace = buffer.toString();
            let replacingContent = fs.readFileSync(endFile, 'utf-8');
            replacingContent = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_cleanerCommunJsDeclaration).call(this, replacingContent);
            let totaltext = textToreplace.replace(tRegex, replacingContent);
            __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_setAllConstant).call(this, totaltext);
            const optionalNamespace = await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_doubleDeclarationHandler).call(this, __classPrivateFieldGet(this, _Compile_allConstant, "f"), endFile);
            if (optionalNamespace !== null) {
                let tempsContent = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_replaceContent).call(this, replacingContent, optionalNamespace.double, optionalNamespace.objNameSpace);
                if (replacingContent.match(__classPrivateFieldGet(this, _Compile_namespaceObjectRegex, "f")) == null) {
                    tempsContent = optionalNamespace.data + tempsContent;
                }
                totaltext = textToreplace.replace(tRegex, tempsContent);
            }
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`));
            return fs.promises.writeFile(beginingFile, __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_removeAllBlank).call(this, totaltext));
        });
    }
    async lazyComposerRemplacement(beginingFile, endFile) {
        let time = new Date(Date.now()).toString();
        const beginingBaseName = path.basename(beginingFile);
        const endBaseName = path.basename(endFile);
        fs.promises.readFile(beginingFile, { encoding: 'utf-8' }).then(async (buffer) => {
            const tRegex = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexSectionMaker).call(this, endBaseName);
            let textToreplace = buffer.toString();
            let raw = fs.readFileSync(endFile, 'utf-8');
            let totalClass;
            const condition = (raw.match(RecursiveMatcher.ClassStart) !== null);
            let replacingContent = (condition) ? await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_deletorForClassPromise).call(this, raw).then((dataObj) => {
                totalClass = dataObj.rawValueObj;
                return dataObj.data;
            }) : raw;
            const allClassContent = RecursiveMatcher.getSpecificClassContent(textToreplace, 'Content')[0];
            replacingContent = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_cleanerCommunJsDeclaration).call(this, replacingContent);
            const totalClassContent = allClassContent.replace(tRegex, replacingContent);
            const totalClassDeclaration = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getClassDeclaration).call(this, RecursiveMatcher.contentCleanerRecursion(totalClassContent));
            const inClassDeclaration = Object.values(totalClassDeclaration).flat().filter(e => e != null);
            const optionalNamespace = await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_doubleDeclarationHandler).call(this, inClassDeclaration, endFile);
            if (optionalNamespace !== null) {
                replacingContent = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_replaceContent).call(this, replacingContent, optionalNamespace.double, optionalNamespace.objNameSpace);
                replacingContent = optionalNamespace.data + replacingContent;
                console.log(chalk.bgYellow(chalk.black(`A nameSpaceObject has been made in file:(${path.basename(endFile)}) due to multiple same name constant declaration`), chalk.black(`\nyou must use ${optionalNamespace.objNameSpace}.(${optionalNamespace.double}) for reference in other file`)));
                inClassDeclaration.push(optionalNamespace.objNameSpace);
            }
            const getAsset = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getAssetPathConst).call(this);
            replacingContent = await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_contentCleaner).call(this, replacingContent, inClassDeclaration, Object.keys(getAsset));
            if (typeof totalClass != 'undefined') {
                for (const [key, value] of Object.entries(totalClass)) {
                    const regexsection = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexSectionMakerForClass).call(this, key);
                    textToreplace = textToreplace.replace(regexsection, value);
                }
            }
            let totaltext = textToreplace.replace(tRegex, replacingContent);
            console.log(chalk.green(`fichier ${beginingBaseName} mise à jour ${time}`));
            return fs.promises.writeFile(beginingFile, __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_removeAllBlank).call(this, totaltext));
        });
    }
    repopulateComposer(file, composerContext = true) {
        __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_compilerContentPromise).call(this, this.fileDirArray, 'composer')
            .then((data) => {
            if (fs.existsSync(file)) {
                fs.promises.readFile(file, { encoding: 'utf-8' }).then(async (buffer) => {
                    const contentFile = buffer.toString();
                    if (data != contentFile) {
                        return fs.promises.writeFile(file, __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_removeAllBlank).call(this, data));
                    }
                });
            }
            else {
                fs.appendFileSync(file, __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_removeAllBlank).call(this, data));
            }
            (composerContext) ? console.log(chalk.green(`fichier compiler mise à jour ${new Date(Date.now()).toString()} for scene : "${__classPrivateFieldGet(this, _Compile_compilerDir, "f")}"`)) : '';
        })
            .catch((err) => {
            console.log(`${err}\n${new Date(Date.now()).toString()}`);
        });
    }
    repopulatelinkFile(file, composerContext = true) {
        __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_compilerContentPromise).call(this, this.fileDirArray, 'linkfile')
            .then((data) => {
            __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_setAllConstant).call(this, data);
            if (fs.existsSync(file)) {
                fs.promises.readFile(file, { encoding: 'utf-8' }).then(async (buffer) => {
                    const contentFile = buffer.toString();
                    if (data != contentFile) {
                        return fs.promises.writeFile(file, __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_removeAllBlank).call(this, data));
                    }
                });
            }
            else {
                fs.appendFileSync(file, data);
            }
            (composerContext) ? console.log(chalk.green(`fichier linkfile mise à jour ${new Date(Date.now()).toString()} for scene : "${__classPrivateFieldGet(this, _Compile_compilerDir, "f")}"`)) : '';
        })
            .catch((err) => {
            console.log(chalk.red(`${err} \n${new Date(Date.now()).toString()}`));
        });
    }
    async repopulateContentString() {
        await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_compilerContentPromise).call(this, this.fileDirArray, 'composer');
    }
    addimportScript(file) {
        const basenameFile = path.basename(file);
        if (!['configImport.js', 'resizeSetting.js'].includes(basenameFile)) {
            fs.promises.readFile(file, { encoding: 'utf-8' }).then(async (buffer) => {
                const content = buffer.toString();
                if (content.match(__classPrivateFieldGet(this, _Compile_regeximportStatementCommunjs, "f")) == null) {
                    const text = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getImportStript).call(this) + content;
                    console.log(chalk.green(`the import statement as been added to '${path.basename(file)}'`));
                    return fs.promises.writeFile(file, text);
                }
            });
        }
    }
}
_Compile_matchregexVariableDeclaration = new WeakMap(), _Compile_commentRemover = new WeakMap(), _Compile_matchregexConstantDelcaration = new WeakMap(), _Compile_matchparamDeclaration = new WeakMap(), _Compile_regeximportStatementCommunjs = new WeakMap(), _Compile_namespaceObjectRegex = new WeakMap(), _Compile_getfunctionName = new WeakMap(), _Compile_regexDeclaration = new WeakMap(), _Compile_regexpathimport = new WeakMap(), _Compile_regexremoveBlank = new WeakMap(), _Compile_allConstant = new WeakMap(), _Compile_compilerDir = new WeakMap(), _Compile_instances = new WeakSet(), _Compile_setAllConstant = function _Compile_setAllConstant(text) {
    const objectmatchDelcaration = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getTotaldeclaration).call(this, RecursiveMatcher.contentCleanerRecursion(text));
    __classPrivateFieldSet(this, _Compile_allConstant, Object.values(objectmatchDelcaration).flat().filter(e => e != null) ?? [], "f");
}, _Compile_addToAllConstant = function _Compile_addToAllConstant(...array) {
    __classPrivateFieldSet(this, _Compile_allConstant, __classPrivateFieldGet(this, _Compile_allConstant, "f")?.concat(array) ?? array, "f");
}, _Compile_getfileDirarraySlice = function _Compile_getfileDirarraySlice(start, end) {
    return this.fileDirArray.slice(start, end);
}, _Compile_replaceContent = function _Compile_replaceContent(text, arrayWord, objNameSpace) {
    for (const word of arrayWord) {
        const regex = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexChangerConst).call(this, word);
        text = text.replace(regex, `${objNameSpace}.${word}`);
    }
    return text;
}, _Compile_checkdouble = function _Compile_checkdouble(array) {
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
}, _Compile_getTotaldeclaration = function _Compile_getTotaldeclaration(text) {
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
}, _Compile_getClassDeclaration = function _Compile_getClassDeclaration(text) {
    const allVariablewordConst = text.match(__classPrivateFieldGet(this, _Compile_matchregexConstantDelcaration, "f"));
    const matchparamDeclaration = text.match(__classPrivateFieldGet(this, _Compile_matchparamDeclaration, "f"));
    return {
        paramClass: matchparamDeclaration,
        constant: allVariablewordConst,
    };
}, _Compile_getContentFile = async function _Compile_getContentFile(fileArray) {
    let compiledContent = `${__classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getImportCommunJsScript).call(this)}\n`;
    const getAsset = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getAssetPathConst).call(this);
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
            content = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_cleanerCommunJsDeclaration).call(this, content);
            const DeclarationObject = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getTotaldeclaration).call(this, RecursiveMatcher.contentCleanerRecursion(content));
            const allMatchedDecaration = Object.values(DeclarationObject).flat().filter(e => e != null);
            totalDeclaration = totalDeclaration?.concat(allMatchedDecaration) ?? [];
            const optionalNamespace = await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_doubleDeclarationHandler).call(this, totalDeclaration, fileArray[i]);
            if (optionalNamespace != null) {
                let cleanContent = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_replaceContent).call(this, content, optionalNamespace.double, optionalNamespace.objNameSpace);
                content = optionalNamespace.data + cleanContent;
                totalDeclaration = optionalNamespace.clean;
            }
            compiledContent += `//----|${path.basename(fileArray[i])}|----\n${content}\n//&end\n`;
        }
    }
    compiledContent += __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getExportScript).call(this, __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getAllExportName).call(this, compiledContent));
    return compiledContent.trim();
}, _Compile_objectNamespaceMakerPromise = function _Compile_objectNamespaceMakerPromise(array, file) {
    return new Promise((resolve, reject) => {
        if (array == null) {
            resolve(null);
        }
        reject(this.nameSpaceMaker(file));
    });
}, _Compile_doubleDeclarationHandler = async function _Compile_doubleDeclarationHandler(array, file) {
    const { double, uniqueArray } = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_checkdouble).call(this, array);
    const ObjectMakerPromise = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_objectNamespaceMakerPromise).call(this, double, file);
    let objectNamespaceContent;
    await ObjectMakerPromise.then((data) => {
        objectNamespaceContent = data;
    })
        .catch((dataErr) => {
        const namespaceKey = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_formatName).call(this, file, '__', '__');
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
}, _Compile_getComposerContent = async function _Compile_getComposerContent(fileArray) {
    let compiledContent = "import { ImageCache,ImagesCacheHandler } from '../../../_types/app/model/cache/cacheImageUtility.js'";
    compiledContent += __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getImportEsmScript).call(this);
    compiledContent += '//----|Class_Content|----\n//No Class\n//&end';
    compiledContent += '\nclass Content {\n';
    const getAsset = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getAssetPathConst).call(this);
    for (let [key, values] of Object.entries(getAsset)) {
        compiledContent += `static ${key} = {\n`;
        for (let [key, value] of Object.entries(values)) {
            compiledContent += `${key}:new ImageCache('${value}'),\n`;
        }
        compiledContent += `\n}\n`;
    }
    compiledContent += `constructor(){\n`;
    for (let i = 0; i < fileArray.length; i++) {
        const namefile = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_formatName).call(this, fileArray[i], 'file_');
        compiledContent += `\nthis.${namefile}()`;
    }
    compiledContent += '\n}\n';
    let totalConstant = [];
    let totalClass = '';
    for (let i = 0; i < fileArray.length; i++) {
        const Raw = fs.readFileSync(fileArray[i], 'utf-8');
        const condition = (Raw.match(RecursiveMatcher.ClassStart) !== null);
        const contentRaw = (condition) ? await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_deletorForClassPromise).call(this, Raw).then((dataObj) => {
            totalClass += dataObj.value.join('\n');
            return dataObj.data;
        }) : Raw;
        const namefile = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_formatName).call(this, fileArray[i], 'file_');
        let content = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_cleanerCommunJsDeclaration).call(this, contentRaw);
        if (fileArray[i] !== undefined) {
            const declarationObject = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getTotaldeclaration).call(this, RecursiveMatcher.contentCleanerRecursion(content));
            const allMatchedDecaration = Object.values(declarationObject).flat().filter(e => e != null);
            totalConstant = totalConstant?.concat((declarationObject.constant ?? [])) ?? [];
            const optionalNamespace = await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_doubleDeclarationHandler).call(this, totalConstant, fileArray[i]);
            if (optionalNamespace != null) {
                let contentNameSpaced = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_replaceContent).call(this, content, optionalNamespace.double, optionalNamespace.objNameSpace);
                content = optionalNamespace.data + contentNameSpaced;
                totalConstant = optionalNamespace.clean;
                totalConstant.push(optionalNamespace.objNameSpace);
                console.log(chalk.bgYellow(chalk.black(`A nameSpaceObject has been made in file:(${path.basename(fileArray[i])}) due to multiple same name constant declaration`), chalk.black(`\nyou must use ${optionalNamespace.objNameSpace}.(${optionalNamespace.double}) for reference in other file`), '\n'));
            }
            const cleanContent = await __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_contentCleaner).call(this, content, totalConstant, Object.keys(getAsset));
            content = `${cleanContent}\n//&end\n`;
        }
        compiledContent += `${namefile}(){\n//----|${path.basename(fileArray[i])}|----\n${content}\n}\n`;
    }
    compiledContent = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_cleanerCommunJsDeclaration).call(this, compiledContent);
    compiledContent += '\n}\n';
    compiledContent += `\ndocument.addEventListener('DOMContentLoaded', async() => {\n\tnew Content()\n\tawait ImagesCacheHandler.saveNameToLocalStorage()\n});\n `;
    const tregex = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexSectionMaker).call(this, 'Class_Content');
    compiledContent = compiledContent.replace(tregex, totalClass);
    return compiledContent.trim();
}, _Compile_contentCleaner = async function _Compile_contentCleaner(contentRaw, totalConstant, asset) {
    asset.forEach((e) => {
        const regex = new RegExp(`\\b(${e}[.]([A-z]|[A-z]\\w+))\\b`, 'g');
        if (contentRaw.match(regex) !== null) {
            contentRaw = contentRaw.replace(regex, `Content.${e}.$2.url`);
        }
    });
    const condition = (contentRaw.match(RecursiveMatcher.functionName) !== null);
    let contentTransform = (condition) ? __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_replacorForFunctionPromise).call(this, contentRaw) : contentRaw;
    let cleanContent;
    if (contentTransform instanceof Promise) {
        cleanContent = await contentTransform.then(async (dataObj) => {
            let tempsContent = dataObj.cleanText;
            totalConstant.forEach((e) => {
                const regex = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexChangerConst).call(this, e);
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
            const regex = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_regexChangerConst).call(this, e);
            contentTransform = contentTransform.replace(regex, `this.${e}`);
        });
        cleanContent = contentTransform;
    }
    return cleanContent;
}, _Compile_formatName = function _Compile_formatName(pathfile, prefix, suffix) {
    if (fs.lstatSync(pathfile).isFile()) {
        pathfile = path.basename(pathfile).split(".").join("").replace(/(c?js)/g, "");
        return (prefix ?? '') + pathfile.replace(/[0-9]+/g, "") + (suffix ?? '');
    }
    else {
        throw new Error(`${pathfile} n'est pas un fichier`);
    }
}, _Compile_classModifyGenerator = function* _Compile_classModifyGenerator(arrayClass) {
    for (let classe of arrayClass) {
        const getClassName = classe.match(RecursiveMatcher.ClassName)[0];
        yield `//----|${getClassName}|----\n${classe}\n//&endClass\n`;
    }
}, _Compile_regexChangerConst = function _Compile_regexChangerConst(word) {
    return new RegExp(`(?<!((\\_\\_)[A-z]\\w+(\\_\\_\\.)))(((const)((\\s?)+))(\\b${word}\\b)|(\\b${word}\\b))`, 'g');
}, _Compile_cleanerCommunJsDeclaration = function _Compile_cleanerCommunJsDeclaration(text) {
    if (__classPrivateFieldGet(this, _Compile_regeximportStatementCommunjs, "f").test(text)) {
        text = text.replace(__classPrivateFieldGet(this, _Compile_regeximportStatementCommunjs, "f"), '');
    }
    return text;
}, _Compile_deletorForClassPromise = function _Compile_deletorForClassPromise(text) {
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
        const generateClassModif = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_classModifyGenerator).call(this, values);
        resolve({
            data: textWithoutClass,
            value: [...generateClassModif],
            rawValueObj: rawValueObj
        });
    });
}, _Compile_replacorForFunctionPromise = function _Compile_replacorForFunctionPromise(text) {
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
}, _Compile_regexSectionMaker = function _Compile_regexSectionMaker(toSection) {
    return new RegExp(`((?<=(\\/\\/----)[\\|](${toSection}).*\n))(.+?)(?=((\\/\\/&end)\\b))`, "s");
}, _Compile_regexSectionMakerForClass = function _Compile_regexSectionMakerForClass(toSection) {
    return new RegExp(`((?<=(\\/\\/----)[\\|](${toSection}).*\n))(.+?)(?=((\\/\\/&endClass)\\b))`, "s");
}, _Compile_removeAllBlank = function _Compile_removeAllBlank(text) {
    return text.replace(__classPrivateFieldGet(this, _Compile_regexremoveBlank, "f"), '\n');
}, _Compile_getAllExportName = function _Compile_getAllExportName(content) {
    const alltheFunction = RecursiveMatcher.getAllFunctionContent(content);
    if (alltheFunction !== null) {
        alltheFunction.forEach((e) => {
            content = content.replace(e, '');
        });
    }
    let arrayDeclaration = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getTotaldeclaration).call(this, content).constant;
    arrayDeclaration = content.match(__classPrivateFieldGet(this, _Compile_getfunctionName, "f"))?.concat(arrayDeclaration) ?? arrayDeclaration;
    return arrayDeclaration;
}, _Compile_getExportScript = function _Compile_getExportScript(constArray) {
    let exportsScript = '';
    for (const [key, value] of Object.entries(__classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getConfigUtilty).call(this))) {
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
}, _Compile_getImportStript = function _Compile_getImportStript(jumpLine = true) {
    let importScript = 'const { ';
    for (let index in __classPrivateFieldGet(this, _Compile_allConstant, "f")) {
        importScript += `${__classPrivateFieldGet(this, _Compile_allConstant, "f")[index]},`;
        importScript += (parseInt(index) % 3 == 0) ? '\n\t' : ' ';
    }
    importScript += `} = require('../../public/versionning/linkFile.js')`;
    importScript += (jumpLine) ? '\n' : '';
    return importScript;
}, _Compile_getAssetPathConst = function _Compile_getAssetPathConst() {
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
}, _Compile_getConfigUtilty = function _Compile_getConfigUtilty() {
    const configFile = PathUtility.getPathFromElement(__classPrivateFieldGet(this, _Compile_compilerDir, "f"), 'compile_param.json');
    const contentConfig = fs.readFileSync(configFile, 'utf-8');
    const json = JSON.parse(contentConfig);
    return json.dependencies;
}, _Compile_getImportCommunJsScript = function _Compile_getImportCommunJsScript() {
    let content = '';
    const configUtility = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getConfigUtilty).call(this);
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
}, _Compile_getImportEsmScript = function _Compile_getImportEsmScript() {
    let content = '';
    const configUtility = __classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getConfigUtilty).call(this);
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
}, _Compile_compilerContentPromise = function _Compile_compilerContentPromise(arrayFile, typedata) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("la compilation des donnée à pris trop de temps");
        }, 3000);
        if (typedata == 'linkfile') {
            resolve(__classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getContentFile).call(this, arrayFile));
        }
        else if (typedata == 'composer') {
            resolve(__classPrivateFieldGet(this, _Compile_instances, "m", _Compile_getComposerContent).call(this, arrayFile));
        }
        else {
            reject(`typedata: ${typedata} non reconnu `);
        }
    });
};
export default Compile;
