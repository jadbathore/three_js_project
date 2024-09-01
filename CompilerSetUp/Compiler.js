import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Utility from './Utility.js';
import { allFile,mapAsset, mapFile } from './pathUtility.js';
import {loadConfigFile} from 'rollup/loadConfigFile'
import {rollup,watch} from 'rollup';

const complierFile = path.join(process.cwd(),'public','versionning','compling.js')
const linkFile = path.join(process.cwd(),'public','versionning','linkfile.js')

/*
français :
    fait fonctionner l'a connection entre rollup et le compiling.js avec l'option watch qui vas regarder les changement effectuer sur compling
English:
    makes the connection between rollup and compiling.js work with the watch option which will watch the changes made on compiling
*/
loadConfigFile(path.resolve(process.cwd(), 'rollup.config.js'), {
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
});


const UtilityClass = new Utility(allFile,mapAsset);

/*
français: 
    composer permet la compilation des donnée du threeElement en un seul fichier
English:
    composer allows the compilation of the data of the threeElement into a single file
*/
export const composer = () =>
{
    UtilityClass.repopulateComposer()
    UtilityClass.repopulatelinkFile()
    
    for(const [key,value] of mapFile)
        {
            if(key !== undefined)
                {
                    /*
                    français: 
                        syntaxe effectuer en accort avec la documentation de fs:node 
                        chaque abort controller est relier à un dossier par exemple tout les dossier mesh sont relier au meme abort contrôler 
                        c'est pour cela que c'est possible de supprimé un fichier durant l'activation du server mais c'est tout de même déconseiller 
                        par contre on peux ajouté sans problème des fichiers (mais pas des dossiers). il faudra le faire quand le server ne tourne pas.
                    English:
                        syntax performed in accordance with the fs:node documentation
                        each abort controller is linked to a folder for example all mesh folders are linked to the same abort controller
                        this is why it is possible to delete a file during server activation but it is still not recommended
                        on the other hand we can add files without problem (but not folders).You must doing it during the server is not running.
                    */
                    const ac = new AbortController()
                    const { signal } = ac;
                    (
                        async () => {
                            try {
                                const watcher = fs.promises.watch(path.join(process.cwd(),'threeElement',key),{signal})
                                for await(const event of watcher)
                                {
                                    switch(event.eventType)
                                    {
                                        case 'change':
                                            console.log(chalk.keyword('violet')(`the file ${event.filename} as been ${event.eventType} 🔮`))
                                            UtilityClass.addimportScript(path.join(process.cwd(),'threeElement',key,event.filename));
                                            UtilityClass.lazyRemplacementComposer(complierFile,path.join(process.cwd(),'threeElement',key,event.filename));
                                            UtilityClass.lazyRemplacementComposer(linkFile,path.join(process.cwd(),'threeElement',key,event.filename))
                                        break;
                                        case 'rename' : 
                                        //if the file is remove
                                        if(value.includes(event.filename))
                                        {
                                            const testor = fs.readdirSync(path.join(process.cwd(),'threeElement',key))
                                            if(!testor.includes(event.filename))
                                            {
                                                ac.abort();
                                                UtilityClass.fileDirArray.splice(UtilityClass.fileDirArray.indexOf(path.join(process.cwd(),'threeElement',key,event.filename)),1)
                                                value.splice(value.indexOf(event.filename),1)
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} is now unwatch and delete 🔮`));
                                            } else {
                                                console.log(chalk.keyword('violet')(`the file ${event.filename} as been change 🔮`));
                                                UtilityClass.lazyRemplacementComposer(complierFile,path.join(process.cwd(),'threeElement',key,event.filename));
                                                UtilityClass.lazyRemplacementComposer(linkFile,path.join(process.cwd(),'threeElement',key,event.filename))
                                            }
                                        //the file is added
                                        } else {
                                            console.log(chalk.keyword('violet')(`the file ${event.filename} is now added 🔮`));
                                            UtilityClass.fileDirArray.push(path.join(process.cwd(),'threeElement',key,event.filename))
                                            UtilityClass.fileDirArray = UtilityClass.mapContent(UtilityClass.fileDirArray)
                                            value.push(event.filename)
                                            UtilityClass.addimportScript(path.join(process.cwd(),'threeElement',key,event.filename))
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