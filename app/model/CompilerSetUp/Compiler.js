import chalk from 'chalk';
import fs from 'fs';
// @ts-ignore
import path from 'path';
import Utility from './Utility/Utility.js';
import PathUtility from './Utility/pathUtility.js';
// @ts-ignore
import {loadConfigFile} from 'rollup/loadConfigFile'
import {rollup,watch} from 'rollup';


/*
français :
    fait fonctionner l'a connection entre rollup et le compiling.js avec l'option watch qui vas regarder les changement effectuer sur compling
English:
    makes the connection between rollup and compiling.js work with the watch option which will watch the changes made on compiling
*/
export function rollupWatchConfig(){
    loadConfigFile(PathUtility.getRollupFile(), {
        format: 'es'
        //@ts-ignore
    }).then(async ({ options, warnings }) => {
        console.log(chalk.keyword('orange')(`Nous avons ${warnings.count} avertissement de la part de rollup`));
        warnings.flush();
        for (const optionsObj of options) {
            const bundle = await rollup(optionsObj);
            await Promise.all(optionsObj.output.map(bundle.write));
        }
        watch(options)
        console.log(chalk.green('le fichier dist est connecté avec succée !'))
    // @ts-ignore
    }).catch((error)=>{
        console.log(chalk.bgRed(error))
    });
}

export class Compiler {
    /**
     * @type {LibFile.Observer}
     */
    #observer

    /**
     * @type {AbortController[]}
     */
    #abortControllerList;

    /**
     * @type {LibFile.Subject}
     */
    #subject

    /**
     * @type {Utility}
     */
    #compilerUtility


    /**
     * @type {string}
     */
    #sceneName

    /**
     * @param {LibFile.Observer} observer 
     * @param {LibFile.Subject} subject
     * @param {string} sceneName 
     */
    constructor(observer,subject,sceneName){
        this.#observer = observer;
        this.#subject = subject;
        this.#subject.attach(this.#observer);
        console.log(chalk.bgBlue(`compiler created On path`))
        this.#compilerUtility = new Utility(sceneName);
        this.#sceneName = sceneName
    }

    get sceneName(){
        return this.#sceneName;
    }

    compile()
    {
        if(!this.#abortControllerList) 
        {
            if(!fs.existsSync(PathUtility.versionDIR)) {
                fs.promises.mkdir(PathUtility.versionDIR, { recursive: true })
                .then((path) => console.log(chalk.green('Directory created successfully',path)))
                .catch((err) => console.error('Error creating directory:', err));
            }
            const cFile = PathUtility.getcompilerFile()
            const lFile = PathUtility.getlinkFile() 
            this.#compilerUtility.repopulateComposer(cFile)
            this.#compilerUtility.repopulatelinkFile(lFile)
            this.#abortControllerList = []
            for(const [key,value] of PathUtility.getMapFile())
                {
                    if(key !== undefined)
                        {
                            const ac = new AbortController()
                            const { signal } = ac;
                            this.#abortControllerList.push(ac);
                            (
                                async () => {
                                    try {
                                        const watcher = fs.promises.watch(PathUtility.getPathFromElement(key),{signal})
                                        for await(const event of watcher)
                                        {
                                            this.#observer.addEvent(event);
                                            this.#subject.notify(event)
                                            const pathFileChanging = PathUtility.getPathFromElement(key,event.filename)
                                            switch(event.eventType)
                                            {
                                                case 'change':
                                                    console.log(chalk.keyword('violet')(`the file ${event.filename} as been ${event.eventType} 🔮`))
                                                    this.#compilerUtility.lazyComposerRemplacement(cFile,pathFileChanging);
                                                    this.#compilerUtility.lazyRemplacement(lFile,pathFileChanging)
                                                    this.#compilerUtility.addimportScript(pathFileChanging);
                                                break;
                                                case 'rename' : 
                                                //if the file is remove
                                                if(value.includes(event.filename))
                                                {
                                                    const testor = fs.readdirSync(PathUtility.getPathFromElement(key))
                                                    if(!testor.includes(event.filename))
                                                    {
                                                        ac.abort();
                                                        this.#compilerUtility.fileDirArray.splice(this.#compilerUtility.fileDirArray.indexOf(pathFileChanging),1)
                                                        value.splice(value.indexOf(event.filename),1)
                                                        console.log(chalk.keyword('violet')(`the file ${event.filename} is now unwatch and delete 🔮`));
                                                    } else {
                                                        console.log(chalk.keyword('violet')(`the file ${event.filename} as been change 🔮`));
                                                        this.#compilerUtility.lazyRemplacement(lFile,pathFileChanging);
                                                        this.#compilerUtility.lazyComposerRemplacement(cFile,pathFileChanging)
                                                        this.#compilerUtility.addimportScript(pathFileChanging)
        
                                                    }
                                                //the file is added
                                                } else {
                                                    console.log(chalk.keyword('violet')(`the file ${event.filename} is now added 🔮`));
                                                    this.#compilerUtility.fileDirArray.push(pathFileChanging)
                                                    this.#compilerUtility.fileDirArray = this.#compilerUtility.setMapFile(this.#compilerUtility.fileDirArray)
                                                    value.push(event.filename)
                                                    this.#compilerUtility.addimportScript(pathFileChanging)
                                                }
                                                break;
                                            }
                                        }
                                    } catch(err) {
                                        if(err.name === 'AbortError')
                                            return;
                                        console.log(err)
                                    }
                                }
                            )();
                        }
                    }
        }
        
        }
        
        DestructCompiler(){
            this.#abortControllerList.forEach((abortController)=>{
                abortController.abort()
            })
            this.#subject.detach(this.#observer)
            console.log(chalk.bgBlue(`compiler on path "${this.#observer.path}" is dead`));
            this.#abortControllerList = null;
            console.log(this.#abortControllerList);
        }
}
