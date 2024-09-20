#! /usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import mongoose from 'mongoose';
import path from 'path';
import fs, { appendFile, appendFileSync, existsSync, truncateSync } from 'fs';
import { allExeceptSetting, allFile, basenameExecptSetting, basenameFile,importscript } from "../CompilerSetUp/pathUtility.js";
import commanderHelp from 'commander-help'
import ora from 'ora'
import BinUtility from "./BinUtility.js";

/*
francais :
    code du cli 
english:
    cli code
*/


/*
francais :
    delaration des table à utlisé durant les differentes actions
english:
    development of tables to be used during the different actions
*/
const BinUtilityClass = new BinUtility()
mongoose.connect('mongodb://127.0.0.1:27017/versionningThreeJs')

const mongooseSchema = mongoose.Schema(
    {
        versionName:String,
        date:{type:Date,default:Date.now},
        content:String
    }
)

const VersionningModel = new mongoose.model('versions',mongooseSchema);

const mongooseSchema2 = mongoose.Schema(
    {
        versionName:String,
        fileName:String,
        date:{type:Date,default:Date.now},
        content:String
    }
)
const VersionningModel2 = new mongoose.model('single',mongooseSchema2);

const mongooseSchema3 = mongoose.Schema(
    {
        UsableName:String,
        name:String,
        date:{type:Date,default:Date.now},
        content: {}
    }
)
const ReusableModel = new mongoose.model('usable',mongooseSchema3);
//---------------------------------ThreeCli----------------------------------------------
/*
français : 
    déclaration de ThreeCli pour permettre à commanderhelp d'afficher correctement les descriptions
english:
threeCli declaration to allow commanderhelp to display descriptions correctly
*/
program
.name('ThreeCli')
.description('Cli three js to render different build')
.option("-h, -help", "list helper").action(()=>{
    console.log('\n',chalk.green(figlet.textSync('ThreeCLI', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
    process.exit();
})
.version('1.0.0')
//---------------------------------save-------------------------------------------------
/*
français : 
    déclaration de la commande save pour permettre à enregister sur base de donné mongoDB en different format 
    format :
        - "raw" c'est à dire prend le fichier public/versionning/compling.js et l'enregiste avec un nom haché spécial
        - "single" prend un fichier <file> hash toute les constants pour évité tout conflit de nom
        - "usable" prend tout les fichiers dans le threeElement les enregiste dans une dictionnaire réutlisable 
English:
    declaration of the save command to allow saving on mongoDB database in different format
    format :
        - "raw" i.e. take the file public/versionning/compling.js and save it with a special hashed name
        - "single" take a file <file> hash all the constants to avoid any name conflict
        - "usable" take all the files in the threeElement save them in a reusable dictionary
*/
program
.command('save') 
.option('-s, --single <file>','save a single file')
.option('-u, --usable <name>','save a re-usable file')
.action(async(option)=>{
    //option -s + -u
    if(option.single && option.usable)
    {
        console.log(chalk.keyword('orange')('you can\'t mix option single and usable(usable is to save all file in a reusable manner)'))
        process.exit()
    }
    if(!option.single){ 
        //option -u 
        if(option.usable)
            {
                const version = `UsableSave_${new mongoose.Types.ObjectId().toString()}`
                const fileDictonary = {}
                for(let i = 0;i < allFile.length;i++)
                {
                    const content = fs.readFileSync(allFile[i],'utf-8')
                    fileDictonary[allFile[i]] = content
                }
                const add = new ReusableModel({
                    UsableName:version,
                    name:option.usable,
                    content: fileDictonary,
                    })
                await add.save()
                BinUtilityClass.successSaveMessage('fichier usable sauvegarder :',version,{name:option.usable})
                process.exit()
            } else {
                const pathfile = path.join(process.cwd(),'public','versionning','compling.js')
                const content = fs.readFileSync(pathfile,'utf-8');
                const versionName = `versions_${new mongoose.Types.ObjectId().toString()}`
                const add = new VersionningModel({
                    versionName:versionName,
                    content:content
                    })
                    await add.save();
                    BinUtilityClass.successSaveMessage('fichier compiling.js sauvegarder :',versionName)
                process.exit()
            }
            //option -s
        } else {
            const hash = new mongoose.Types.ObjectId().toString()
            const versionName = `versions_${hash}`
            const a = basenameFile.indexOf(option.single)
            if(a !== -1)
            {
                const content = fs.readFileSync(allFile[a],'utf-8')
                const allConstArray = BinUtilityClass.getAllExportName(content)
                let remplacement = {}
                for(let i=0;i<allConstArray.length;i++)
                {
                    remplacement[allConstArray[i]] = `${allConstArray[i]}_${hash}`
                }
                const add = new VersionningModel2({
                    versionName:versionName,
                    fileName:option.single,
                    content: BinUtilityClass.replaceMultiple(content,remplacement)
                    })
                await add.save()
                const optionsMessage = {file:option.single}
                BinUtilityClass.successSaveMessage(`fichier ${option.single} sauvegarder :`,versionName,optionsMessage)
                process.exit();
                //no option
            } else {
                console.log(chalk.keyword('orange')('fichier non reconnu voici les fichiers acceptable.'))
                BinUtilityClass.choiceCallback('fichier accetable',basenameExecptSetting,(result)=>{
                    setTimeout(async()=>
                    {
                        const spinner = ora(`Doing ${result.choice}...`).start();
                        spinner.succeed(chalk.green(`ok for ${result.choice}`))
                        const choicesindex = basenameFile.indexOf(result.choice)
                        const content = fs.readFileSync(allFile[choicesindex],'utf-8')
                        const allConstArray = BinUtilityClass.getAllExportName(content)
                        let remplacement = {}
                        for(let i=0;i<allConstArray.length;i++)
                        {
                            remplacement[allConstArray[i]] = `${allConstArray[i]}_${hash}`
                        }
                        const add = new VersionningModel2({
                            versionName:versionName,
                            fileName: result.choice,
                            content: BinUtilityClass.replaceMultiple(content,remplacement)
                            })
                            await add.save()
                            BinUtilityClass.successSaveMessage(`fichier ${result.choice} sauvegarder :`,versionName,{file:result.choice})
                            process.exit();
                    },100)
                    
                })
            }
        }
})
.description('save a file in a mongoDB')
//---------------------------------fork-------------------------------------------------
/*
français : 
    déclaration de la commande fork permet de réutliser les élements dans précedament enregisté
    format :
        - "raw" le fork un fichier versionning.js
        - "singlefile" fork un fichier dans la table single et le l'ajoute a un dossier crée nommé 'AppendElement
        - "sv" fork un version en particulier
English:
    declaration of the fork command allows to reuse the elements in previously saved
    format :
        - "raw" fork a file versionning.js
        - "singlefile" fork a file in the single table and add it to a created folder named 'AppendElement
        - "sv" fork a particular version
*/
program
.command('fork')
.option('-sf, --singlefile <file>','fork a single file')
.option('-sv ,--fileversion <file>','fork a specific version')
.action(async(option)=>{
    // no option
if(!option.singlefile && !option.fileversion){
    const request  = await VersionningModel.find().sort({_id: -1}).limit(1);
    BinUtilityClass.appendFileWithMango(request)
    console.log(chalk.green('element ajouter ✨'))
    process.exit()
}
// -sf
if(option.singlefile && !option.fileversion){
    const request  = await VersionningModel2.findOne({fileName:option.singlefile});
    if(request === null){
        const request = await VersionningModel2.find({})
        const tableChoice = []
        for(let i = 0; i < request.length; i++ )
        {
            let title = request[i].versionName
            tableChoice.push(title)
        }
        BinUtilityClass.choiceCallback(`aucun model avec le nom ${option.singlefile}...`,tableChoice,(result)=> {
            const spinner = ora(`Doing ${result.choice}...`).start();
            setTimeout(async() => {
                const request2  = await VersionningModel2.findOne({versionName:result.choice});
                spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                BinUtilityClass.appendFileWithMango(request2,'single')
                console.log(chalk.green('element ajouter ✨'))
                process.exit()
            },100)
        })
    } else {
        BinUtilityClass.appendFileWithMango(request,'single') 
        process.exit()
    }
}
// -sv
if(!option.singlefile && option.fileversion){
    const request  = await VersionningModel.findOne({version:option.fileversion});
    if(request === null){
        const request = await VersionningModel.find({})
        const tableChoice = []
        for(let i = 0; i < request.length; i++ )
        {
            let title = request[i].versionName
            tableChoice.push(title)
        }
        BinUtilityClass.choiceCallback(`aucun model avec le nom ${option.fileversion}...`,tableChoice,(result)=>{
            const spinner = ora(`Doing ${result.choice}...`).start();
            setTimeout(async() => {
                spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                const request2  = await VersionningModel.findOne({versionName:result.choice});
                BinUtilityClass.appendFileWithMango(request2,'singleVersion')
                console.log(chalk.green('element ajouter ✨'))
                process.exit()
            },100)
        })
    } else {
        BinUtilityClass.appendFileWithMango(request)
        process.exit()
    }
}
// -sf + -sv
if(option.singlefile && option.fileversion){
    const request  = await VersionningModel.findOne({versionName:versionName});
    BinUtilityClass.appendFileWithMango(request)
    process.exit()
}
}
)
.description('append a file by a saved version (by default the last version)')

//---------------------------------readFile-------------------------------------------------
/*
français :
    commande de test l'api inquerer permettant de questionner l'utilisateur en cas d'erreur 
English:
    test command the inquerer api to question the user in case of error 
*/
program.command('readFile').action(
    ()=>{
        BinUtilityClass.choiceCallback('fichier à lire',basenameFile,(result)=>{
            const spinner = ora(`Doing ${result.choice}...`).start();
            setTimeout(() => {
                spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                const choicesindex = basenameFile.indexOf(result.choice)
                console.log(chalk.blue(fs.readFileSync(allFile[choicesindex],'utf-8'))) 
            },100)
        })
    }
).description('testCommandCli')

//------------------------------------usable------------------------------------------------
/*
français:
    commande usable permettant de supprimé tout les élément du ThreeElement (excepter les setting) 
    pour les remplacé par une version usable précedament sauvegardé 
English:
    usable command to delete all elements of the ThreeElement (except the settings)
    to replace them with a previously saved usable version
*/
program.command('usable').action(
    async()=>{
        const request = await ReusableModel.find({})
        const nameArray = []
        for(let i = 0; i < request.length; i++)
        {
            nameArray.push(request[i].name)
        }
        BinUtilityClass.choiceCallback('liste des docs usable...',nameArray,(result)=>{
            const spinner = ora(`Doing ${result.choice}...`).start();
            setTimeout(async() => {
                spinner.succeed(chalk.green(`element : '${result.choice}' choisi`))
                const request = await ReusableModel.findOne({name:result.choice})
                for(let i = 0;i<allFile.length;i++)
                    {
                        fs.rmSync(allFile[i],{recursive:true})
                    }
                        
                for (const key in request.content) {
                    if(existsSync(key)){
                        fs.truncateSync(key)
                        fs.appendFileSync(key,request.content[key])
                    } else {
                        fs.appendFileSync(key,request.content[key])
                    }
                }
                const loader = path.join(process.cwd(),'threeElement','loader','loader.js')
                if(!existsSync(loader))
                {
                    appendFileSync(loader,'const loader = new THREE.TextureLoader();')
                }
                console.log(chalk.green('tous les fichiers utilisable on été rechargé avec succée ✨'));
                process.exit()
            },100)
        })
    }
).description('re-use a usable pre-save version')

//------------------------------------clear------------------------------------------------
/*
français:
    supprime les elements de threeElements
English:
    removes elements from threeElements
*/
program.command('clear').action(
    ()=>{
        // correspondant a uniquement loader et animate.js
        if(allExeceptSetting.length !== 2)
        {
            for(let i = 0;i< allFile.length;i++)
            {
                fs.truncateSync(allFile[i])
                const fileCoresponding = path.basename(allFile[i]).split('.js').join('.txt');
                const filecorrespondingpath = path.join(process.cwd(),'makeFileRessource','clearDefault',fileCoresponding)
                const exist = fs.existsSync(filecorrespondingpath);
                if(exist)
                {
                    const readable = fs.readFileSync(filecorrespondingpath);
                    fs.appendFileSync(allFile[i],readable);
                } else {
                    fs.rmSync(allFile[i],{recursive:true});
                }
            }
            console.log(chalk.keyword('yellow')('Dossier ThreeElement nettoyer et prés à l\'emploi 🧹'))
            process.exit()
        } else {
            console.log(chalk.green('Dossier ThreeElement déja nettoyer'))
            process.exit()
        }
    }
).description('clear directory "threeElement" leave only the Setting and the animate function truncated')
//------------------------------------make------------------------------------------------

program.command('make')
.option('-mC,--mesh_Cube <namefile>','make a mesh cube')
.option('-mS,--mesh_Sphere <namefile>','make a mesh sphere')
.option('-lL,--loader_Loader <namefile>','make a loader')
.option('-aL,--asset_light <namefile>','make a light')
.action(
    (option)=>{
        for (let [key, value] of Object.entries(option)) {
            const dir = key.split('_')[0]
            key += ".txt"
            BinUtilityClass.makeAfile(key,value,dir)
        }
        process.exit();
    }
).description('make a file')

//------------------------------------importscript------------------------------------------------
/*
français :
    import un script d'import des constants depuis linkfile ce qui permet de réutlisé des element d'autre fichier et 
    égalment d'utlise les importation faite dans le fichier threeElement/Setting/configImport
English:
    import a constant import script from linkfile which allows to reuse elements from other files and
    also to use the imports made in the threeElement/Setting/configImport file
*/
program.command('importScripts').action(
    ()=>{
        importscript()
        process.exit()
    }
).description('add import script to all ThreeElement file who\'s not already as some import script()this import script will not be read by the compiler')

program.helpInformation = ()=> {
    return '';
};
//------------------------------------setting------------------------------------------------
/*
français:
    affichage des commandes utlisable grâce a commande import 
English:
    display of commands usable through import command
*/
program.on('--help', () => {
    console.log('\n',chalk.green(figlet.textSync('ThreeCli', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
    process.exit()
});

program.parse()