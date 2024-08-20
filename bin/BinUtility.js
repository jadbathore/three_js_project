import inquirer from "inquirer"; 
import boxen from 'boxen';
import chalk from "chalk";
import path from 'path';
import fs from 'fs';



export default class BinUtility {
/*
français : 
    formate un message selon plusieur  option :
    - sans c'est juste le nom + le temps
    - avec c'est nom + version + dictonnaire utlisant chaque option
    comme paramètre
English:
    formats a message according to several options:
    - without it's just the name + the time
    - with it's name + version + dictionary using each option
    as a parameter
*/
    successSaveMessage(bannerMessage,version,option=null)
    {
        if(option == null)
        {
            console.log('\n' + chalk.keyword('violet')(bannerMessage) + '\n\n' +
            chalk.green(
            boxen(`version: '${version}' \ntime: '${new Date(Date.now()).toString()}'`,
            {
                padding: 1,
                height: 2 ,
            }
            )));
        } else {
            const banner = `\n${chalk.keyword('violet')(bannerMessage)}\n\n`
            let content = `version: '${version}' \n`
            for(let i in option)
            {
                content += `${i}: ${option[i]}\n`
            }
            content+= `time:'${new Date(Date.now()).toString()}'`
            console.log(banner + chalk.green(boxen(content,
            {
                padding: 1,
                height: 2 ,
            })))
        }
    }

/*
français : 
    utlise l'api inquierer pour formatter un call back celui ci sera un choix
    par exemple je me suis trompé sur le nom du fichier je retourne cette method
    avec comme paramètre un fonction callback qui me permettra de géré l'erreur
English:
    use the inquierer api to format a callback this will be a choice
    for example if I made a mistake on the name of the file I return this method
    with as parameter a callback function which will allow me to manage the error
*/
    choiceCallback(message,arraychoice,callback) {
        inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: message,
                choices: arraychoice,
            },
        ]).then((result) => {
            callback(result)
        })
    }
/*
français : 
    gere les differentes requetes consernant l'ajout 
English:
    handles the various requests concerning the addition
*/
    appendFileWithMango(mangoRequest,option = null)
    {
        const createdPath = path.join(process.cwd(),'threeElement','AppendElement')
        if(!fs.existsSync(createdPath))
        {
            fs.mkdir(createdPath,(error)=>{
                error ? console.log(chalk.red(`erreur : ${error}`)) : 
                console.log(chalk.green('dossier ajouter avec succées ✨')) 
            })
        }
        if(option == 'single')
        {
            const filename = 'appendElement_' + mangoRequest.versionName + '.js'
            const pathcreatedFile =  path.join(process.cwd(),'ThreeElement','AppendElement',filename)
            return fs.appendFileSync(pathcreatedFile,mangoRequest.content);
        }else if(option =='singleVersion'){
            const filename = mangoRequest.versionName + '.js'
            const pathcreatedFile =  path.join(process.cwd(),'public','versionning',filename)
            return fs.appendFileSync(pathcreatedFile,mangoRequest.content);
        } else {
            const filename = mangoRequest[0].versionName + '.js'
            const pathcreatedFile =  path.join(process.cwd(),'public','versionning',filename)
            return fs.appendFileSync(pathcreatedFile,mangoRequest[0].content);
        }
    }
    
/*
français :
    permet le remplacement des donné (utlisé pour le hashage des constantes)
English:
    allows data replacement (used for hashing constants)
*/
    replaceMultiple(str, replacements) {
        for (let [oldStr, newStr] of Object.entries(replacements)) {
            str = str.split(oldStr).join(newStr);
        }
        return str;
    }
}



