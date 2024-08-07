import inquirer from "inquirer"; 
import boxen from 'boxen';
import chalk from "chalk";
import path from 'path';
import fs from 'fs';



export default class BinUtility {

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
    
    
    
    replaceMultiple(str, replacements) {
        for (let [oldStr, newStr] of Object.entries(replacements)) {
            str = str.split(oldStr).join(newStr);
        }
        return str;
    }
}



