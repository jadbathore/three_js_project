#! /usr/bin/env node
const yargs = require("yargs")
const chalk  = require("chalk");
const EnumCLI = require("./enumCLI")
const figlet = require("figlet")




const usage = chalk.keyword('violet')('\nUsage: ThreeCli <command>')
const option = yargs 
.usage(usage)
.option('SFile',{
    alias:"command",
    describe:"save the file in a mongoDB folder",
    type:"string",
    demandOption: false
})
.help(true)
.argv;


const typeCommand = EnumCLI.getType(yargs.argv.command)

console.log(typeCommand)
// console.log(yargs.argv.SFile)

// if(yargs.argv.command == null){
//     console.log(
//         chalk.green(
//           figlet.textSync('ThreeCLI', { horizontalLayout: 'full' })
//         )
//       );
//     yargs.showHelp();
//     return;
// }

