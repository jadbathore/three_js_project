#! /usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer"; 
import chalk from "chalk";
import figlet from "figlet";
import mongoose from 'mongoose';
import path from 'path';
import boxen from 'boxen';
import fs from 'fs';
import { basenameFile } from "../CompilerSetUp/pathUtility.js";
import commanderHelp from 'commander-help'



mongoose.connect('mongodb://127.0.0.1:27017/versionningThreeJs')
const mongooseSchema = mongoose.Schema(
    {
        versionName:String,
        date:{type:Date,default:Date.now},
        content:String
    }
)

const VersionningModel = new mongoose.model('versions',mongooseSchema);

program
.name('ThreeCli')
.description('Cli three js to render different build')
.option("-h, -help", "list helper").action(()=>{
    console.log('\n',chalk.green(figlet.textSync('ThreeCLI', { horizontalLayout: 'full',font:'Colossal'})))
    commanderHelp(program)
})
.version('1.0.0')

program.command('save').action(()=>{
    const pathfile = path.join(process.cwd(),'public','versionning','compling.js')
    const content = fs.readFileSync(pathfile,'utf-8');
    const versionName = `versions_${new mongoose.Types.ObjectId().toString()}`
    const add = new VersionningModel({
        versionName:versionName,
        content:content
        })
        add.save();
        console.log('\n' + chalk.keyword('violet')('element sauvegardé compling.js :') + '\n\n' +
            chalk.green(
            boxen(`version: '${versionName}' \ntime: '${new Date(Date.now()).toString()}'`,
            {
                padding: 1,
                height: 2 ,
            }
            )));
}).description('save a file in a mongoDB')


program.helpInformation = function() {
    return '';
};

program.name('ThreeCli')

program.command('watchFile').action(
    ()=>{
        inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "chosis un fichier à regarder:",
            choices: basenameFile,
        },
    ]).then((result) => {
        const spinner = console.log(`Doing ${result.choice}...`);
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





