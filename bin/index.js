#! /usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer"; 
import chalk from "chalk";
import figlet from "figlet";
import mongoose from 'mongoose';
import path from 'path';
import boxen from 'boxen';
import fs from 'fs';
import { allFile, basenameFile } from "../CompilerSetUp/pathUtility.js";
import commanderHelp from 'commander-help'
import ora from 'ora'




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



function successSaveMessage(version,option=null)
{
    if(option == null)
    {
        console.log('\n' + chalk.keyword('violet')('element compling.js sauvegardé :') + '\n\n' +
        chalk.green(
        boxen(`version: '${version}' \ntime: '${new Date(Date.now()).toString()}'`,
        {
            padding: 1,
            height: 2 ,
        }
        )));

    } else {
        const banner = `\n${chalk.keyword('violet')('element sauvegardé :')}\n\n`
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
function choiceCallback(message,callback) {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: message,
            choices: basenameFile,
        },
    ]).then((result) => {
        callback(result)
    })
}

function appendFile(path)
{
    
}



program
.name('ThreeCli')
.description('Cli three js to render different build')
.option("-h, -help", "list helper").action(()=>{
    console.log('\n',chalk.green(figlet.textSync('ThreeCLI', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
})
.version('1.0.0')

program
.command('save') 
.option('-s, --single <file>','save a single file')
.action((option)=>{
    if(!option.single){ 
    const pathfile = path.join(process.cwd(),'public','versionning','compling.js')
    const content = fs.readFileSync(pathfile,'utf-8');
    const versionName = `versions_${new mongoose.Types.ObjectId().toString()}`
    const add = new VersionningModel({
        versionName:versionName,
        content:content
        })
        add.save();
        successSaveMessage(versionName)
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
                add.save()
                const optionsMessage = {file:option.single}
                successSaveMessage(versionName,optionsMessage)
                process.exit();
            } else {
                console.log(chalk.keyword('orange')('fichier non reconnu voici les fichiers accèptable.'))
                choiceCallback('fichier accetable',(result)=>{
                    setTimeout(()=>
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
                            add.save()
                            successSaveMessage(versionName,{file:result.choice})
                            process.exit();
                    },100)
                    
                })
            }
        }
})
.description('save a file in a mongoDB')


program
.command('fork')
.option('-sf, --singlefile <file>','fork a single file')
.option('-sv ,--fileversion <file>','fork a specific version')
.action(async(option)=>{
if(!option.singlefile && !option.fileversion){
    const test  = await VersionningModel.find().sort({_id: -1}).limit(1);
    const filename = test[0].versionName + '.js'
    const pathcreatedFile =  path.join(process.cwd(),'public','versionning',filename)
    fs.appendFile(pathcreatedFile,test[0].content,(error)=>{
        error ? console.log(chalk.red(`erreur : ${error}`)) : 
        console.log(chalk.green('fichier ajouter avec succées ✨')) 
    });
}
if(option.singlefile && !option.fileversion){
    const test  = await VersionningModel2.findOne({fileName:option.singlefile});
    const filename = test[0].versionName + '.js'
    const pathcreatedFile =  path.join(process.cwd(),'public','versionning',filename)
    fs.appendFile(pathcreatedFile,test[0].content,(error)=>{
        error ? console.log(chalk.red(`erreur : ${error}`)) : 
        console.log(chalk.green('fichier ajouter avec succées ✨')) 
    });
}
if(!option.singlefile && option.fileversion){
    const test  = await VersionningModel2.findOne({fileName:option.singlefile});
    console.log(test)
}
}
)
.description('replace a file by a saved version (by default the last version)')




program.helpInformation = function() {
    return '';
};



program.command('readFile').action(
    ()=>{
        choiceCallback('fichier à lire',(result)=>{
            const spinner = ora(`Doing ${result.choice}...`).start();
            setTimeout(() => {
                spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                const choicesindex = basenameFile.indexOf(result.choice)
                console.log(chalk.blue(fs.readFileSync(allFile[choicesindex],'utf-8'))) 
            },100)
        })
    }
).description('commande de test cli')
program.on('--help', function() {
    console.log('\n',chalk.green(figlet.textSync('ThreeCLI', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
});

program.parse()


// const usage = chalk.keyword('violet')('\nUsage: ThreeCli <command>')
// yargs 
// .usage(usage)
// .command('SaveElement', 'make a get HTTP request',()=>
// {
//     const pathfile = path.join(process.cwd(),'versionning','compling.js')
//     const content = fs.readFileSync(pathfile,'utf-8');
//     const versionName = `versions_${new mongoose.Types.ObjectId().toString()}`
//     const add = new VersionningModel({
//         versionName:versionName,
//         content:content
//         })
//         add.save();
//         console.log('\n' + chalk.keyword('violet')('element sauvegardé versionning/compling.js :') + '\n\n' +
//             chalk.green(
//             boxen(`version: '${versionName}' \ntime: '${new Date(Date.now()).toString()}'`,
//             {
//                 padding: 1,
//                 height: 2 ,
//             }
//             )));
//         yargs.exit();
// })
// .help(true)
// .argv;
// const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
// const filePaths = argv._
// if (filePaths.length == 0) {
//     console.log(
//         
//     );
//     yargs.showHelp()
// }





