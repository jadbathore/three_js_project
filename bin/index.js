#! /usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import mongoose from 'mongoose';
import fs from 'fs';
import PathUtility from "../app/CompilerSetUp/Utility/pathUtility.js";
import commanderHelp from 'commander-help'
import ora from 'ora'
import BinUtility from "./BinUtility.js"
import gradient from 'gradient-string';
import Utility from "../app/CompilerSetUp/Utility/Utility.js";
import { ConnectionUtilityMongoDB } from "../app/databaseConnection/dbConnection.js";
import inquirer from "inquirer";
import { input } from '@inquirer/prompts';

const BinUtilityClass = new BinUtility()
const CompilerUtilityClass = new Utility(PathUtility.getarrayFile(),PathUtility.getMapAsset())
const DB_URI = process.env.DB_URI || "mongodb://127.0.0.1:27017/versionningThreeJs"
const Connection = new ConnectionUtilityMongoDB(DB_URI)

class Bin {

    constructor()
    {
        this.bin_clear();
        this.bin_compile();
        this.bin_testConnection();
        this.bin_make();
        this.bin_importscript();
        Connection.testTheConnectionPromise().then(()=>
        {
            this.bin_fork()
            this.bin_save()
            this.bin_delete()
            this.bin_update()
            this.bin_usable()
            this.bin_ThreeCli()
        }).catch(()=>{
            this.bin_ThreeCli(false)
        }).finally(()=>{
            this.bin_help()
        })
    }

    bin_readfile()
    {
        return program.command('readFile').action(
                ()=>{
                    BinUtilityClass.choiceCallback('fichier à lire',PathUtility.getBasename(),(result)=>{
                        const spinner = ora(`Doing ${result.choice}...`).start();
                        setTimeout(() => {
                            spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                            const choicesindex = PathUtility.getBasename().indexOf(result.choice)
                            console.log(chalk.blue(fs.readFileSync(PathUtility.getarrayFile()[choicesindex],'utf-8'))) 
                            process.exit()
                        },100)
                    })
                }
            ).description('testCommandCli')
    }

    bin_ThreeCli(connection=true)
    {
        return program
        .name('ThreeCli')
        .description('Cli three js to render different build')
        .option("-h, -help", "list helper")
        .action(()=>{
            console.log('\n',gradient(['green','blue', 'red']).multiline(figlet.textSync('ThreeCli', { horizontalLayout: 'full',font:'Colossal'})))
            if(connection == false)
            {
                console.log(chalk.red('You not connected to the mongoose Service so some action are forbiden like :',
                    '\n-fork\n-save\n-delete\n-update\n-usable'
                ))
            }
            commanderHelp(program)
            process.exit();
        })
        .version('1.0.0')
    }

    bin_testConnection()
    {
        return program
        .command('testConnection') 
        .action(()=>{
            const spinner = ora('Waiting for The Return Status...').start()
            Connection.testConnnectionAwaited(spinner)
        })
        .description('test the connection of the database and return the status')
    }

    bin_save()
    {
        return program
        .command('save') 
        .option('-v, --version <name>','save a version of the compiler')
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
                        const modelMongoose = await Connection.saveObject('usable')
                        const version = `UsableSave_${new mongoose.Types.ObjectId().toString()}`
                        const fileDictonary = {}
                        for(let file of PathUtility.getarrayFile())
                        {
                            const content = fs.readFileSync(file,'utf-8')
                            fileDictonary[file] = content
                        }
                        const add = new modelMongoose({
                            UsableName:version,
                            name:option.usable,
                            content: fileDictonary,
                            })
                        await add.save()
                        BinUtilityClass.successSaveMessage('fichier usable sauvegarder :',version,{name:option.usable})
                        process.exit()
                    } else {
                        let answer;
                        if(!option.version)
                        {
                            answer = await input({ message: 'you must name the version (type your name):' });
                        }
                        const modelMongoose = await Connection.saveObject('versions')
                        const pathfile = PathUtility.getcompilerFile()
                        const content = fs.readFileSync(pathfile,'utf-8');
                        const versionName = `versions_${new mongoose.Types.ObjectId().toString()}`
                        const name = option?.version ?? answer;
                        const add = new modelMongoose({
                            versionName:versionName,
                            content:content,
                            name:name,
                            })
                        await add.save();
                        BinUtilityClass.successSaveMessage('fichier compiling.js sauvegarder :',versionName,{name:name})
                                process.exit()
                    }
                    //option -s
                } else {
                    const modelMongoose = await Connection.saveObject('single')
                    const hash = new mongoose.Types.ObjectId().toString()
                    const versionName = `versions_${hash}`
                    const a = PathUtility.getBasename().indexOf(option.single)
                    const regex = /\((.*)\)/g;
                    if(a !== -1)
                    {
                        const formatDate = new Date(Date.now()).toString().replace(regex,'').split(' ').join('_');
                        const nameFile = `${option.singlefile}_${formatDate}`;
                        const content = fs.readFileSync(PathUtility.getarrayFile()[a],'utf-8')
                        CompilerUtilityClass.setAllConstant(content)
                        const allConstArray = CompilerUtilityClass.allConstant
                        let remplacement = {}
                        for(let i=0;i<allConstArray.length;i++)
                        {
                            remplacement[allConstArray[i]] = `${allConstArray[i]}_${hash}`
                        }
                        const add = new modelMongoose({
                            versionName:versionName,
                            name:nameFile,
                            content: BinUtilityClass.replaceMultiple(content,remplacement)
                            })
                        await add.save()
                        const optionsMessage = {name:option.single}
                        BinUtilityClass.successSaveMessage(`fichier ${option.single} sauvegarder :`,versionName,optionsMessage)
                        process.exit();
                        //no option
                    } else {
                        console.log(chalk.keyword('orange')('fichier non reconnu voici les fichiers acceptable.'))
                        BinUtilityClass.choiceCallback('fichier accetable',PathUtility.getBasenameExceptingSetting(),(result)=>{
                            setTimeout(async()=>
                            {
                                const spinner = ora(`Doing ${result.choice}...`).start();
                                spinner.succeed(chalk.green(`ok /${result.choice}`))
                                const choicesindex = PathUtility.getBasename().indexOf(result.choice)
                                const formatDate = new Date(Date.now()).toString().replace(regex,'').split(' ').join('_');
                                const nameFile = result.choice.split('.js').join('') +'_'+formatDate;
                                const content = fs.readFileSync(PathUtility.getarrayFile()[choicesindex],'utf-8')
                                CompilerUtilityClass.setAllConstant(content)
                                const allConstArray = CompilerUtilityClass.allConstant
                                let remplacement = {}
                                for(let i=0;i<allConstArray.length;i++)
                                {
                                    remplacement[allConstArray[i]] = `${allConstArray[i]}_${hash}`
                                }
                                const add = new modelMongoose({
                                    versionName:versionName,
                                    name: nameFile,
                                    content: BinUtilityClass.replaceMultiple(content,remplacement)
                                    })
                                    await add.save()
                                    BinUtilityClass.successSaveMessage(`fichier ${result.choice} sauvegarder :`,versionName,{file:nameFile})
                                    process.exit();
                            },100)
                            
                        })
                    }
                }
        })
        .description('save a file in a mongoDB')
    }
    bin_fork()
    {
        return program
        .command('fork')
        .option('-sf, --singlefile <file>','fork a single file')
        .option('-sv ,--fileversion <file>','fork a specific version')
        .action(async(option)=>{
            // no option
        if(!option.singlefile && !option.fileversion){
            const request  = await Connection.findLastObject('single')
            BinUtilityClass.appendFileWithMango(request) 
            console.log(chalk.green('element ajouter ✨'))
            process.exit()
        }
        // -sf
        if(option.singlefile && !option.fileversion){
            const request  = await Connection.findObject('single',{fileName:option.singlefile});
            if(request === null){
                const request = await Connection.findObject('single')
                const tableChoice = []
                for(let i = 0; i < request.length; i++ )
                {
                    let title = request[i].name
                    tableChoice.push(title)
                }
                BinUtilityClass.choiceCallback(`aucun model avec le nom ${option.singlefile}...`,tableChoice,(result)=> {
                    const spinner = ora(`Doing ${result.choice}...`).start();
                    setTimeout(async() => {
                        const request2  = await Connection.findObject('single',{fileName:result.choice});
                        spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                        BinUtilityClass.appendFileWithMango(request2)
                        console.log(chalk.green('element ajouter ✨'))
                        process.exit()
                    },100)
                })
            } else {
                BinUtilityClass.appendFileWithMango(request) 
                process.exit()
            }
        }
        // -sv
            if(!option.singlefile && option.fileversion){
                const request = await Connection.findObject('versions',{version:option.fileversion});
                if(request === null){
                    const request = await Connection.findObject('versions')
                    const tableChoice = []
                    for(let i = 0; i < request.length; i++ )
                    {
                        let title = request[i].name
                        tableChoice.push(title)
                    }
                    BinUtilityClass.choiceCallback(`aucun model avec le nom ${option.fileversion}...`,tableChoice,(result)=>{
                        const spinner = ora(`Doing ${result.choice}...`).start();
                        setTimeout(async() => {
                            spinner.succeed(chalk.blue(`element : '${result.choice}' choisi`))
                            const request  = await Connection.findObject('versions',{versionName:result.choice});
                            BinUtilityClass.appendFileIfnotExist(PathUtility.getPathFromPublic('versionning',request[0].name),request[0].content)
                            console.log(chalk.green('element ajouter ✨'))
                            process.exit()
                        },100)
                    })
                } else {
                    BinUtilityClass.appendFileIfnotExist(PathUtility.getPathFromPublic('versionning',request[0].name),request[0].content)
                    console.log(chalk.green('element ajouter ✨'))
                    process.exit()
                }
            }
        }
        )
        .description('append a file by a saved version (by default the last version)')
    }
    bin_update()
    {
        return program
        .command('update')
        .option('-t, --table <tableName>','Update table')
        .action(async(option)=>{
        
            const tableArray = ["versions","single","usable"] 
            let optionnalQuestion;
            const condition = (!option.table || !tableArray.includes(option.table))
            if(condition){
                optionnalQuestion = await inquirer.prompt([
                    {
                        type: "list",
                        name: "choice",
                        message: 'You must choice witch table you want to update...',
                        choices: tableArray,
                    },
                ])
            }
            const table = (condition)? optionnalQuestion.choice :option.table
            const tableToUpdate = await Connection.findObject(table) 
            const tableChoice = []
            if(tableToUpdate.length <= 1)
                {
                    console.log(chalk.blue('the table is empty'))
                    process.exit()
                }
            for(let i = 0; i < tableToUpdate.length; i++ )
                {
                    let title = tableToUpdate[i].name
                    tableChoice.push(title)
                }
                const witchelement = await inquirer.prompt([
                    {
                        type: "list",
                        name: "choice",
                        message: 'Which element you wath to update ?',
                        choices: tableChoice,
                    },
                ])
                const contentToUpdate = await inquirer.prompt([
                    {
                        type: "list",
                        name: "choice",
                        message: 'What do you want to update ?',
                        choices: ['content','name']
                    },
                ])
                if(contentToUpdate.choice == 'name')
                {
                    const inputName = await input({message:'type the new name you want to give :'})
                    await Connection.UpdateObject(table,{name:witchelement.choice},{name:inputName})
                    console.log(chalk.blue(`the former element ${witchelement.choice} as been rename ${inputName}`))
                    process.exit()
                } else {
                    switch(table){
                        case"versions":
                            const pathfile = PathUtility.getcompilerFile()
                            const content = fs.readFileSync(pathfile,'utf-8');
                            await Connection.UpdateObject(table,{name:witchelement.choice},{content:content})
                            break;
                        case"single":
                            const contentReplaceElement = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "choice",
                                    message: 'What element would you like to replace this content with?',
                                    choices: PathUtility.getBasename()
                                },
                            ])
                            const choicesindex = PathUtility.getBasename().indexOf(contentReplaceElement.choice)
                            const contentFile = fs.readFileSync(PathUtility.getarrayFile()[choicesindex],'utf-8')
                            await Connection.UpdateObject(table,{name:witchelement.choice},{content:contentFile})
                        break;
                        case"usable": 
                        const fileDictonary = {}
                        for(let file of PathUtility.getarrayFile())
                        {
                            const content = fs.readFileSync(file,'utf-8')
                            fileDictonary[file] = content
                        }
                        await Connection.UpdateObject(table,{name:witchelement.choice},{content:fileDictonary})
                        break;
                        default:throw new Error('unknowed table') 
                    }
                    console.log(chalk.blue(`the content of the element ${witchelement.choice} change`))
                    process.exit();
                }
        })
    }
    bin_delete(){
        return program
        .command('delete')
        .option('-t, --table <tableName>','delete element')
        .action(async(option)=>{
        const tableArray = ["versions","single","usable"] 
        let optionnalQuestion;
        const condition = (!option.table || !tableArray.includes(option.table))
        if(condition){
            optionnalQuestion = await inquirer.prompt([
                {
                    type: "list",
                    name: "choice",
                    message: 'You must choice witch table you want to update...',
                    choices: tableArray,
                },
            ])
        }
        const table = (condition)? optionnalQuestion.choice :option.table
        const tableToUpdate = await Connection.findObject(table) 
        const tableChoice = []
        if(tableToUpdate.length <= 1)
        {
            console.log(chalk.blue('the table is empty'))
            process.exit()
        }
            for(let i = 0; i < tableToUpdate.length; i++ )
            {
                let title = tableToUpdate[i].name
                tableChoice.push(title)
            }
            const witchelement = await inquirer.prompt([
                {
                    type: "list",
                    name: "choice",
                    message: 'Which element you wath to update ?',
                    choices: tableChoice,
                },
            ])
            await Connection.DeleteObject(table,{name:witchelement.choice})
            console.log(chalk.blue(`the content of the element ${witchelement.choice} has been delete`))
        
        process.exit();
        })
    }
    bin_usable(){
        return program.command('usable')
        .action(
            async()=>{
                // const modelObject = await Connection.findObject('usable')
                // console.log(modelObject)
                const request = await Connection.findObject('usable')
                const nameArray = []
                for(let i = 0; i < request.length; i++)
                {
                    nameArray.push(request[i].name)
                }
                BinUtilityClass.choiceCallback('liste des docs usable...',nameArray,async(result)=>{
                    const spinner = ora(`Doing ${result.choice}...`).start();
                    setTimeout(async() => {
                        spinner.succeed(chalk.green(`element : '${result.choice}' choisi`))
                        const request2 = await Connection.findObject('usable',{name:result.choice})
                        for(let i = 0;i<PathUtility.getarrayFile().length;i++)
                            {
                                fs.rmSync(PathUtility.getarrayFile()[i],{recursive:true})
                            }
                        for (const key in request2[0].content) {
                            if(fs.existsSync(key)){
                                fs.truncateSync(key)
                                fs.appendFileSync(key,request2[0].content[key])
                            } else {
                                fs.appendFileSync(key,request2[0].content[key])
                            }
                        }
                        console.log(chalk.green('tous les fichiers utilisable on été rechargé avec succée ✨'));
                        process.exit()
                    },100)
                })
            }
        ).description('re-use a usable pre-save version')
    }
    bin_clear(){
        return program
        .command('clear')
        .option('-f,--force','force cleaning')
        .action(
            (option)=>{
                if(PathUtility.getArrayFileExeceptSetting().length !== 2 || (option?.force))
                {
                    for(let file of PathUtility.getarrayFile())
                    {
                        fs.rmSync(file);
                    }
                    BinUtilityClass.repopulateUtility()
                    console.log(chalk.keyword('yellow')('ThreeElement dir clean and ready to roll 🧹'))
                    process.exit()
                } else {
                    console.log(chalk.green('ThreeElement already clean ✨'))
                    process.exit()
                }
            }
        ).description('clear directory "threeElement" leave only the Setting and the animate function truncated')
    }
    bin_make()
    {
        return program.command('make')
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
    }
    bin_importscript(){
        return program.command('importScripts')
        .action(
            async()=>{
                const spinner = ora('script writing in progress...').start()
                spinner.color = 'green'
                setTimeout(async()=>{
                    await BinUtilityClass.WriterFilePromiseHandler(spinner)
                },500)
        
        }).description('add import script to all ThreeElement file who\'s not already as some import script()this import script will not be read by the compiler')
    }
    bin_compile()
    {
        program.command('compile').action(()=>{
            CompilerUtilityClass.repopulateComposer(PathUtility.getcompilerFile())
            CompilerUtilityClass.repopulatelinkFile(PathUtility.getlinkFile())
            process.exit()
        }).description('add import')
    }

    bin_help()
    {
        program.helpInformation = ()=> {
            return '';
        };
        
        program.on('--help', () => {
            console.log('\n',gradient(['green','blue', 'red']).multiline(figlet.textSync('ThreeCli', { horizontalLayout: 'full',font:'Colossal'})))
            commanderHelp(program)
            process.exit()
        });
        
        program.parse()
    }
}

(new Bin())