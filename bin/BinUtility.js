import inquirer from "inquirer"; 
import boxen from 'boxen';
import chalk from "chalk";
import path, { basename, resolve } from 'path';
import fs from 'fs';
import PathUtility from "../app/CompilerSetUp/Utility/pathUtility.js";
import Utility from "../app/CompilerSetUp/Utility/Utility.js";
import { error } from "console";



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
    appendFileWithMango(mangoRequest)
    {
        
        const createdPath = PathUtility.getPathFromElement('AppendElement')
        if(!fs.existsSync(createdPath))
        {
            fs.mkdirSync(createdPath)
        }
        const filename = mangoRequest[0].versionName + '.js'
        const pathcreatedFile =  PathUtility.getPathFromElement('AppendElement',filename)
        return fs.appendFileSync(pathcreatedFile,mangoRequest[0].content);
    }

    makeAfile(ressource,filetoappend,dir = 'Mesh'){
        const meshpath = PathUtility.getPathFromPublic('makeFileRessource',dir,ressource)
        if(fs.existsSync(meshpath))
        {
            let data = fs.readFileSync(meshpath,'utf-8');
            const regex = new RegExp('#name#','g')
            data = data.split(regex).join(filetoappend);
            const file = filetoappend + '.js'
            const pathfile = PathUtility.getPathFromElement(dir,file)
            if(fs.existsSync(pathfile))
            {
                console.log(chalk.red(`le fichier ${file} existe déja`));
            } else {
                fs.appendFileSync(pathfile,data);
            }
        } else {
            console.log(chalk.red(`la ressource : '${ressource}' n'existe pas`));
        }
    }

    appendFileIfnotExist(path,content){
        return(fs.existsSync(path)) ? '':fs.appendFileSync(path,content);
    }
    repopulateUtility(){
        const resourceFilePath = PathUtility.getPathFromPublic('makeFileRessource','clearDefault')
        for(let file of fs.readdirSync(resourceFilePath))
        {
            const pathFileRead = PathUtility.getPathFromPublic('makeFileRessource','clearDefault',file)
            const fileUtilityWrite = file.split('.txt').join('.js').split('_')
            const pathFileWrite = PathUtility.getPathFromElement(...fileUtilityWrite)
            const pathFileReadcontent = fs.readFileSync(pathFileRead,{encoding:'utf-8'})
            fs.appendFileSync(pathFileWrite,pathFileReadcontent)
        }
    }

    async *ReaderFilePromiseGenerator()
    {
        const CompilerUtility = new Utility(PathUtility.getarrayFile(),PathUtility.getMapAsset());
        CompilerUtility.repopulatelinkFile(PathUtility.getlinkFile(),false)
        this.CompilerUtilityArray = CompilerUtility.getfileDirarraySlice(1,-1);
        for (let file of  this.CompilerUtilityArray)
        {
            const readPromise = await fs.promises.readFile(file,{encoding:"utf-8"}).then((buffer)=>{
                let readPromiseContentString = buffer.toString()
                readPromiseContentString = CompilerUtility.cleanerCommunJsDeclaration(readPromiseContentString)
                const firstline = readPromiseContentString.split('\n')[0]
                const linejumpCondition = (firstline.match(/[^\n]+/g) != null)
                readPromiseContentString = CompilerUtility.getImportStript(linejumpCondition) + readPromiseContentString
                return readPromiseContentString

            })
            yield [file,readPromise]
        } 
    }

    async WriterFilePromiseHandler(spinner)
    {
        const promiseBasket = []
        for await (const [file,readPromise] of this.ReaderFilePromiseGenerator())
        {
            const writepromise = fs.promises.writeFile(file,readPromise).then(()=>{
                spinner.text = `${path.basename(file)} script is writed`
            })
            .catch((err)=>{
                spinner.failed(err)
            })
            promiseBasket.push(writepromise)
        } 

        Promise.allSettled(promiseBasket).then((results) =>
        {
            if(results.length === this.CompilerUtilityArray.length)
            {
                spinner.succeed('all script are append to the file')
                process.exit()
            }
        });
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

