import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Utility from '../../CompilerSetUp//Utility/Utility.js';
import PathUtility from '../../CompilerSetUp/Utility/pathUtility.js';
import {loadConfigFile} from 'rollup/loadConfigFile'
import {rollup,watch} from 'rollup';
import { abort } from 'process';


const complierFile = PathUtility.getcompilerFile()
const linkFile = PathUtility.getlinkFile()                                                   

/*
français :
    fait fonctionner l'a connection entre rollup et le compiling.js avec l'option watch qui vas regarder les changement effectuer sur compling
English:
    makes the connection between rollup and compiling.js work with the watch option which will watch the changes made on compiling
*/
export function rollupWatchConfig(){
    loadConfigFile(PathUtility.getRollupFile(), {
        format: 'es'
    }).then(async ({ options, warnings }) => {
        console.log(chalk.keyword('orange')(`Nous avons ${warnings.count} avertissement de la part de rollup`));
        warnings.flush();
        for (const optionsObj of options) {
            const bundle = await rollup(optionsObj);
            await Promise.all(optionsObj.output.map(bundle.write));
        }
        watch(options)
        console.log(chalk.green('le fichier dist est connecté avec succée !'))
    }).catch((error)=>{
        console.log(chalk.bgRed(error))
    });
}





// const UtilityClass = new Utility(PathUtility.rootDirProjectName);  

class compiler {
    #observer
    #utilityClass
    #AbortArray = []
    constructor(observer,watchDir){
        this.#observer = observer;
        this.#utilityClass = new Utility(watchDir);
    }

    compile(subject){
        subject.attach(this.#observer)
        this.#utilityClass.repopulateComposer(PathUtility.getcompilerFile())
        this.#utilityClass.repopulatelinkFile(PathUtility.getlinkFile())
        for(const [key,value] of PathUtility.getMapFile())
            {
                if(key !== undefined)
                    {
                        const ac = new AbortController();
                        const { signal } = ac;
                        this.#AbortArray.push(ac) 
                        (
                            async () => {
                                try {
                                    const watcher = fs.promises.watch(PathUtility.getPathFromElement(key),{signal})
                                    for await(const event of watcher)
                                    {
                                        this.#observer.addEvent(event);
                                        subject.notify(event)
                                        const pathFileChanging = PathUtility.getPathFromElement(key,event.filename)
                                        switch(event.eventType)
                                        {
                                            case 'change':
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} as been ${event.eventType} 🔮`))
                                                this.#utilityClass.lazyComposerRemplacement(complierFile,pathFileChanging);
                                                this.#utilityClass.lazyRemplacement(linkFile,pathFileChanging)
                                                this.#utilityClass.addimportScript(pathFileChanging);
                                            break;
                                            case 'rename' : 
                                            //if the file is remove
                                            if(value.includes(event.filename))
                                            {
                                                const testor = fs.readdirSync(PathUtility.getPathFromElement(key))
                                                if(!testor.includes(event.filename))
                                                {
                                                    ac.abort();
                                                    this.#utilityClass.fileDirArray.splice(UtilityClass.fileDirArray.indexOf(pathFileChanging),1)
                                                    value.splice(value.indexOf(event.filename),1)
                                                    console.log(chalk.keyword('violet')(`the file ${event.filename} is now unwatch and delete 🔮`));
                                                } else {
                                                    console.log(chalk.keyword('violet')(`the file ${event.filename} as been change 🔮`));
                                                    this.#utilityClass.lazyRemplacement(linkFile,pathFileChanging);
                                                    this.#utilityClass.lazyComposerRemplacement(complierFile,pathFileChanging)
                                                    this.#utilityClass.addimportScript(pathFileChanging)

                                                }
                                            //the file is added
                                            } else {
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} is now added 🔮`));
                                                this.#utilityClass.fileDirArray.push(pathFileChanging)
                                                this.#utilityClass.fileDirArray = UtilityClass.setMapFile(UtilityClass.fileDirArray)
                                                value.push(event.filename)
                                                this.#utilityClass.addimportScript(pathFileChanging)
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

    detacheCompiler(){
        this.#AbortArray.forEach((signal) => {
            signal.abort();
        })
    }
} 


/*
français: 
    composer permet la compilation des donnée du threeElement en un seul fichier
English:
    composer allows the compilation of the data of the threeElement into a single file
*/

export const compiler = (subject,observer) =>
{
    subject.attach(observer)
    UtilityClass.repopulateComposer(PathUtility.getcompilerFile())
    UtilityClass.repopulatelinkFile(PathUtility.getlinkFile())
    for(const [key,value] of PathUtility.getMapFile())
        {
            if(key !== undefined)
                {
                    const ac = new AbortController()
                    const { signal } = ac;
                    (
                        async () => {
                            try {
                                const watcher = fs.promises.watch(PathUtility.getPathFromElement(key),{signal})
                                for await(const event of watcher)
                                {
                                    observer.addEvent(event);
                                    subject.notify(event)
                                    const pathFileChanging = PathUtility.getPathFromElement(key,event.filename)
                                    switch(event.eventType)
                                    {
                                        case 'change':
                                            console.log(chalk.keyword('violet')(`the file ${event.filename} as been ${event.eventType} 🔮`))
                                            UtilityClass.lazyComposerRemplacement(complierFile,pathFileChanging);
                                            UtilityClass.lazyRemplacement(linkFile,pathFileChanging)
                                            UtilityClass.addimportScript(pathFileChanging);
                                        break;
                                        case 'rename' : 
                                        //if the file is remove
                                        if(value.includes(event.filename))
                                        {
                                            const testor = fs.readdirSync(PathUtility.getPathFromElement(key))
                                            if(!testor.includes(event.filename))
                                            {
                                                ac.abort();
                                                UtilityClass.fileDirArray.splice(UtilityClass.fileDirArray.indexOf(pathFileChanging),1)
                                                value.splice(value.indexOf(event.filename),1)
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} is now unwatch and delete 🔮`));
                                            } else {
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} as been change 🔮`));
                                                UtilityClass.lazyRemplacement(linkFile,pathFileChanging);
                                                UtilityClass.lazyComposerRemplacement(complierFile,pathFileChanging)
                                                UtilityClass.addimportScript(pathFileChanging)

                                            }
                                        //the file is added
                                        } else {
                                            console.log(chalk.keyword('violet')(`the file ${event.filename} is now added 🔮`));
                                            UtilityClass.fileDirArray.push(pathFileChanging)
                                            UtilityClass.fileDirArray = UtilityClass.setMapFile(UtilityClass.fileDirArray)
                                            value.push(event.filename)
                                            UtilityClass.addimportScript(pathFileChanging)
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