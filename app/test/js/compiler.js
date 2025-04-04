
// rollupWatchConfig();
// const context = new Context(new ServerStrategy(router));
// context.runServer();

import chalk from 'chalk';
import fs from 'fs';
import Utility from '../../CompilerSetUp/Utility/Utility.js';
import PathUtility from '../../CompilerSetUp/Utility/pathUtility.js';


export default class Compiler {
    /**
     * @type {LibFile.Observer}
     */
    #observer

    /**
     * @type {AbortController[]}
     */
    #abortControllerList = []

    /**
     * @type {LibFile.Subject}
     */
    #subject

    /**
     * @type {Utility}
     */
    #compilerUtility

    /**
     * @param {LibFile.Observer} observer 
     * @param {LibFile.Subject} subject 
     */
    constructor(observer,subject){
        this.#observer = observer;
        this.#subject = subject;
        this.#subject.attach(this.#observer);
        console.log(chalk.bgBlue(`compiler created On path`))
        this.#compilerUtility = new Utility(PathUtility.rootDirProjectName);
    }

    compile()
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
        
        DestructCompiler(){
            this.#abortControllerList.forEach((abortController)=>{
                abortController.abort()
            })
            this.#subject.detach(this.#observer)
            console.log(chalk.bgBlue(`compiler on path "${this.#observer.path}" is dead`));
        }
}
