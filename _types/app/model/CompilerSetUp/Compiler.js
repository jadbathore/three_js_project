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
var _Compiler_observer, _Compiler_abortControllerList, _Compiler_subject, _Compiler_compilerUtility, _Compiler_sceneName, _Compiler_cFile, _Compiler_lFile;
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Compile from './Utility/Utility.js';
import PathUtility from './Utility/pathUtility.js';
import { loadConfigFile } from 'rollup/loadConfigFile';
import { rollup, watch } from 'rollup';
export function rollupWatchConfig() {
    loadConfigFile(PathUtility.rollupConfig, {
        format: 'es'
    }).then(async ({ options, warnings }) => {
        console.log(chalk.keyword('orange')(`Nous avons ${warnings.count} avertissement de la part de rollup`));
        warnings.flush();
        for (const optionsObj of options) {
            const bundle = await rollup(optionsObj);
            await Promise.all(optionsObj.output.map(bundle.write));
        }
        watch(options);
        console.log(chalk.green('le fichier dist est connecté avec succée !'));
    }).catch((error) => {
        console.log(chalk.bgRed(error));
    });
}
export class Compiler {
    constructor(observer, subject, sceneName) {
        _Compiler_observer.set(this, void 0);
        _Compiler_abortControllerList.set(this, void 0);
        _Compiler_subject.set(this, void 0);
        _Compiler_compilerUtility.set(this, void 0);
        _Compiler_sceneName.set(this, void 0);
        _Compiler_cFile.set(this, void 0);
        _Compiler_lFile.set(this, void 0);
        __classPrivateFieldSet(this, _Compiler_observer, observer, "f");
        __classPrivateFieldSet(this, _Compiler_subject, subject, "f");
        console.log(chalk.bgBlue(`compiler created for request :"${__classPrivateFieldGet(this, _Compiler_observer, "f").path}"`));
        __classPrivateFieldSet(this, _Compiler_compilerUtility, new Compile(sceneName), "f");
        __classPrivateFieldSet(this, _Compiler_sceneName, sceneName, "f");
        __classPrivateFieldSet(this, _Compiler_cFile, PathUtility.getcompilerFile(), "f");
        __classPrivateFieldSet(this, _Compiler_lFile, PathUtility.getlinkFile(), "f");
    }
    get sceneName() {
        return __classPrivateFieldGet(this, _Compiler_sceneName, "f");
    }
    repopulate() {
        if (!fs.existsSync(PathUtility.versionDIR)) {
            fs.promises.mkdir(PathUtility.versionDIR, { recursive: true })
                .then((path) => console.log(chalk.green('Directory created successfully', path)))
                .catch((err) => console.error('Error creating directory:', err));
        }
        __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").repopulateComposer(__classPrivateFieldGet(this, _Compiler_cFile, "f"));
        __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").repopulatelinkFile(__classPrivateFieldGet(this, _Compiler_lFile, "f"));
    }
    compile() {
        if (!__classPrivateFieldGet(this, _Compiler_abortControllerList, "f")) {
            __classPrivateFieldGet(this, _Compiler_subject, "f").attach(__classPrivateFieldGet(this, _Compiler_observer, "f"));
            if (!fs.existsSync(PathUtility.versionDIR)) {
                fs.promises.mkdir(PathUtility.versionDIR, { recursive: true })
                    .then((path) => console.log(chalk.green('Directory created successfully', path)))
                    .catch((err) => console.error('Error creating directory:', err));
            }
            __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").repopulateComposer(__classPrivateFieldGet(this, _Compiler_cFile, "f"));
            __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").repopulatelinkFile(__classPrivateFieldGet(this, _Compiler_lFile, "f"));
            __classPrivateFieldSet(this, _Compiler_abortControllerList, [], "f");
            for (const [key, value] of PathUtility.getMapFile(__classPrivateFieldGet(this, _Compiler_sceneName, "f"))) {
                if (key !== undefined) {
                    const ac = new AbortController();
                    const { signal } = ac;
                    __classPrivateFieldGet(this, _Compiler_abortControllerList, "f").push(ac);
                    (async () => {
                        try {
                            const watcher = fs.promises.watch(PathUtility.getPathFromElement(__classPrivateFieldGet(this, _Compiler_sceneName, "f"), key), { signal });
                            for await (const event of watcher) {
                                __classPrivateFieldGet(this, _Compiler_subject, "f").notify(event);
                                const pathFileChanging = PathUtility.getPathFromElement(__classPrivateFieldGet(this, _Compiler_sceneName, "f"), key, event.filename);
                                switch (event.eventType) {
                                    case 'change':
                                        console.log(chalk.keyword('violet')(`the file ${event.filename} as been ${event.eventType} 🔮`));
                                        __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").lazyComposerRemplacement(__classPrivateFieldGet(this, _Compiler_cFile, "f"), pathFileChanging);
                                        __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").lazyRemplacement(__classPrivateFieldGet(this, _Compiler_lFile, "f"), pathFileChanging);
                                        __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").addimportScript(pathFileChanging);
                                        break;
                                    case 'rename':
                                        if (value.includes(event.filename)) {
                                            const testor = fs.readdirSync(PathUtility.getPathFromElement(__classPrivateFieldGet(this, _Compiler_sceneName, "f"), key));
                                            if (!testor.includes(event.filename)) {
                                                ac.abort();
                                                __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").fileDirArray.splice(__classPrivateFieldGet(this, _Compiler_compilerUtility, "f").fileDirArray.indexOf(pathFileChanging), 1);
                                                value.splice(value.indexOf(event.filename), 1);
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} is now unwatch and delete 🔮`));
                                            }
                                            else {
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} as been change 🔮`));
                                                __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").lazyRemplacement(__classPrivateFieldGet(this, _Compiler_lFile, "f"), pathFileChanging);
                                                __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").lazyComposerRemplacement(__classPrivateFieldGet(this, _Compiler_cFile, "f"), pathFileChanging);
                                                __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").addimportScript(pathFileChanging);
                                            }
                                        }
                                        else {
                                            console.log(chalk.keyword('violet')(`the file ${event.filename} is now added 🔮`));
                                            __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").fileDirArray.push(pathFileChanging);
                                            __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").fileDirArray = __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").setMapFile(__classPrivateFieldGet(this, _Compiler_compilerUtility, "f").fileDirArray);
                                            value.push(event.filename);
                                            __classPrivateFieldGet(this, _Compiler_compilerUtility, "f").addimportScript(pathFileChanging);
                                        }
                                        break;
                                }
                            }
                        }
                        catch (err) {
                            if (err.name === 'AbortError')
                                return;
                            console.log(err);
                        }
                    })();
                }
            }
            PathUtility.initElement();
        }
    }
    stopCompiler() {
        __classPrivateFieldGet(this, _Compiler_abortControllerList, "f").forEach((abortController) => {
            abortController.abort();
        });
        console.log(chalk.bgBlue(`compiler on path "${__classPrivateFieldGet(this, _Compiler_observer, "f").path}" is stop`));
        __classPrivateFieldSet(this, _Compiler_abortControllerList, null, "f");
    }
    destructCompiler() {
        __classPrivateFieldGet(this, _Compiler_subject, "f").detach(__classPrivateFieldGet(this, _Compiler_observer, "f"));
        console.log(chalk.bgRedBright(`compiler die for path "${__classPrivateFieldGet(this, _Compiler_observer, "f").path}" `));
    }
}
_Compiler_observer = new WeakMap(), _Compiler_abortControllerList = new WeakMap(), _Compiler_subject = new WeakMap(), _Compiler_compilerUtility = new WeakMap(), _Compiler_sceneName = new WeakMap(), _Compiler_cFile = new WeakMap(), _Compiler_lFile = new WeakMap();
