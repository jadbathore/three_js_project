import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Utility from './Utility/Utility.js';
import PathUtility from './Utility/pathUtility.js';
import {loadConfigFile} from 'rollup/loadConfigFile'
import {rollup,watch} from 'rollup';

const complierFile = PathUtility.getcompilerFile()
const linkFile = PathUtility.getlinkFile()

/*
français :
    fait fonctionner l'a connection entre rollup et le compiling.js avec l'option watch qui vas regarder les changement effectuer sur compling
English:
    makes the connection between rollup and compiling.js work with the watch option which will watch the changes made on compiling
*/
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

const UtilityClass = new Utility(PathUtility.getarrayFile(),PathUtility.getMapAsset());

/*
français: 
    composer permet la compilation des donnée du threeElement en un seul fichier
English:
    composer allows the compilation of the data of the threeElement into a single file
*/

/**
 * @public watching a the file 
 * @return void 
 */
export const composer = () =>
{
    UtilityClass.repopulateComposer(PathUtility.getcompilerFile())
    UtilityClass.repopulatelinkFile(PathUtility.getlinkFile())
    for(const [key,value] of PathUtility.getMapFile())
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
                                const watcher = fs.promises.watch(PathUtility.getPathFromElement(key),{signal})
                                for await(const event of watcher)
                                {
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
                                            UtilityClass.fileDirArray = UtilityClass.mapContent(UtilityClass.fileDirArray)
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