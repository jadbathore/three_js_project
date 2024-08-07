#! /usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import mongoose from 'mongoose';
import path from 'path';
import fs, { existsSync } from 'fs';
import { allExeceptSetting, allFile, basenameExecptSetting, basenameFile,importscript } from "../CompilerSetUp/pathUtility.js";
import commanderHelp from 'commander-help'
import ora from 'ora'
import BinUtility from "./BinUtility.js";

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
program
.name('ThreeCli')
.description('Cli three js to render different build')
.option("-h, -help", "list helper").action(()=>{
    console.log('\n',chalk.green(figlet.textSync('ThreeCLI', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
})
.version('1.0.0')
//---------------------------------save-------------------------------------------------
program
.command('save') 
.option('-s, --single <file>','save a single file')
.option('-u, --usable <name>','save a re-usable file')
.action(async(option)=>{
    if(option.single && option.usable)
    {
        console.log(chalk.keyword('orange')('you can\'t mix option single and usable(usable is to save all file in a reusable manner)'))
        process.exit()
    }
    if(!option.single){ 
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
program
.command('fork')
.option('-sf, --singlefile <file>','fork a single file')
.option('-sv ,--fileversion <file>','fork a specific version')
.action(async(option)=>{
if(!option.singlefile && !option.fileversion){
    const request  = await VersionningModel.find().sort({_id: -1}).limit(1);
    BinUtilityClass.appendFileWithMango(request)
    console.log(chalk.green('element ajouter ✨'))
    process.exit()
}
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
if(option.singlefile && option.fileversion){
    const request  = await VersionningModel.findOne({versionName:versionName});
    BinUtilityClass.appendFileWithMango(request)
    process.exit()
}
}
)
.description('replace a file by a saved version (by default the last version)')

//---------------------------------readFile-------------------------------------------------

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
                for (const key in request.content) {
                    if(existsSync(key)){
                        fs.truncateSync(key)
                        fs.appendFileSync(key,request.content[key])
                    } else {
                        fs.appendFileSync(key,request.content[key])
                    }
                }
                console.log(chalk.green('tous les fichiers utilisable on été rechargé avec succée ✨'));
            },100)
        })
    }
).description('re-use a usable pre-save version')

//------------------------------------clear------------------------------------------------

program.command('clear').action(
    ()=>{
        if(allExeceptSetting.length > 1)
        {
            for(let i = 0;i< allExeceptSetting.length;i++)
            {
                if(path.basename(allExeceptSetting[i]) !== 'animate.js')
                {
                    fs.rmSync(allExeceptSetting[i],{recursive:true})
                } else {
                    fs.truncateSync(allExeceptSetting[i])
                    const content = 'function animate()\n{\nrenderer.render(scene,camera)\n}\nrenderer.setAnimationLoop(animate);'
                    fs.appendFileSync(allExeceptSetting[i],content)
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

//------------------------------------importscript------------------------------------------------
program.command('importScripts').action(
    ()=>{
        importscript()
        process.exit()
    }
).description('add import script to all ThreeElement file who\'s not already as some import script()this import script will not be read by the compiler')

program.helpInformation = ()=> {
    return '';
};

program.on('--help', () => {
    console.log('\n',chalk.green(figlet.textSync('ThreeCli', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
    process.exit()
});

program.parse()