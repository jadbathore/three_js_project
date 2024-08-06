#! /usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { allExeceptSetting, allFile, basenameFile } from "../CompilerSetUp/pathUtility.js";
import commanderHelp from 'commander-help'
import ora from 'ora'
import BinUtility from "./BinUtility.js";
import { clear } from "console";



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
.option('-u, --usable','save a re-usable file')
.action(async(option)=>{
    if(option.single && option.usable == true)
    {
        console.log(chalk.keyword('orange')('you can\'t mix option single and usable(usable is to save all file in a reusable manner)'))
        process.exit()
    }
    if(!option.single){ 
        if(option.usable == true)
            {
                const version = `UsableSave_${new mongoose.Types.ObjectId().toString()}`
                const fileDictonary = {}
                for(let i = 0;i < allFile.length;i++)
                {
                    const content = fs.readFileSync(allFile[i],'utf-8')
                    fileDictonary[basenameFile[i]] = content
                }
                const add = new ReusableModel({
                    UsableName:version,
                    content: fileDictonary,
                    })
                await add.save()
                BinUtilityClass.successSaveMessage('fichier usable sauvegarder :',version)
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
            const versionName = `versions_${new mongoose.Types.ObjectId().toString()}`
            const a = basenameFile.indexOf(option.single)
            if(a !== -1)
            {
                const content = fs.readFileSync(allFile[a],'utf-8')
                const add = new VersionningModel2({
                    versionName:versionName,
                    fileName:option.single,
                    content: content
                    })
                await add.save()
                const optionsMessage = {file:option.single}
                BinUtilityClass.successSaveMessage(`fichier ${option.single} sauvegarder :`,versionName,optionsMessage)
                process.exit();
            } else {
                console.log(chalk.keyword('orange')('fichier non reconnu voici les fichiers accèptable.'))
                BinUtilityClass.choiceCallback('fichier accetable',basenameFile,(result)=>{
                    setTimeout(async()=>
                    {
                        const spinner = ora(`Doing ${result.choice}...`).start();
                        spinner.succeed(chalk.green(`ok for ${result.choice}`))
                        const choicesindex = basenameFile.indexOf(result.choice)
                        const content = fs.readFileSync(allFile[choicesindex],'utf-8')
                        const add = new VersionningModel2({
                            versionName:versionName,
                            fileName: result.choice,
                            content: content
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
).description('commande de test cli')

//------------------------------------usable------------------------------------------------
program.command('clear').action(
    ()=>{
        console.log(allExeceptSetting)
        if(allExeceptSetting.length != 1)
        {
            for(let i = 0;i< allExeceptSetting.length;i++)
            {
                if(path.basename(allExeceptSetting[i]) !== 'animate.js')
                {
                    fs.rmSync(allExeceptSetting[i])
                } else {
                    fs.truncateSync(allExeceptSetting[i])
                    const content = 'function animate()\n{\n}\nrenderer.setAnimationLoop(animate);'
                    fs.appendFileSync(allExeceptSetting[i],content)
                }
                console.log(chalk.keyword('yellow')('Dossier ThreeElement nettoyer et prés à l\'emploi 🧹'))
                process.exit()
            }
        } else {
            console.log(chalk.green('Dossier ThreeElement déja nettoyer 🧹'))
            process.exit()
        }
    }
)
//------------------------------------clear------------------------------------------------




program.helpInformation = ()=> {
    return '';
};

program.on('--help', () => {
    console.log('\n',chalk.green(figlet.textSync('ThreeCLI', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
});

program.parse()

