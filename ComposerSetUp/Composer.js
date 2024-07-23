const chalk = require('chalk');
const fs =  require('fs');
const path = require('path');
const Utility = require('./Utility');
const { constants } = require('buffer');



const mapFile = new Map();

constfile = fs.readdirSync('./threeElement/',{withFileTypes:true}).filter(dir => dir.isDirectory()).map(
    (dir)=>{
        const arry = fs.readdirSync(path.join(process.cwd(),'threeElement',dir.name))
        mapFile.set(dir.name,arry)
    })
    ;

const allFile = []

for (const [key, value] of mapFile) {
    for (const file of value)
    {
        const pathFile  = path.join(process.cwd(),'threeElement',key,file)
        allFile.push(pathFile);
    }
}

const UtilityClass = new Utility(allFile);
const pathtolinkFile = path.join(process.cwd(),'versionning','linkFile.js')
const pathtoCompiler = path.join(process.cwd(),'versionning','compling.js')

fs.access(pathtolinkFile,constants.F_OK,(err)=>{
    err ? fs.link(pathtoCompiler,pathtolinkFile,(err)=>{
        if(err)
        {
            console.log(err)
        }
            console.log(chalk.green('the linkfile as been created'))
        // fs.unlink(pathtolinkFile,(err)=> {
        //     console.log(err)
        // });
    }) : '';
}) 

const contentlinkFile = fs.readFileSync(pathtoCompiler,'utf-8')

const regexgetConst = /(?<=[c][o][n][s][t].)[A-z]*/g;
const regexgetfunction = /[f][u][n][c][t][i][o][n].[A-z]*/g;

allConstinfile = contentlinkFile.match(regexgetConst)

let exportsScript = 'module.exports = {'
for(let i = 0; i < allConstinfile.length; i++)
{
    exportsScript+=`\n${allConstinfile[i]}:${allConstinfile[i]}`
    if(i == allConstinfile.length-1)
    {
        exportsScript+='\n}'
    }
}

fs.appendFile(pathtolinkFile,exportsScript,(error)=>{
    if(error)
        {
            console.log(error)
        }
    });









// UtilityClass.repopulateComposer()
// for(let i = 0;i< UtilityClass.fileDirArray.length;i++){
//     fs.watch(UtilityClass.fileDirArray[i], async(event, file) => {
//         switch (event)
//         {
//             case 'change': await UtilityClass.repopulateComposer(); break;
//             case 'rename': console.log(chalk.keyword('orange')('⚠️ do not change name or remove some file during the process ⚠️'));break;
//             default : return;
//         }
//         console.log(chalk.keyword('violet')(`the file ${file} as been ${event} 🔮`))
//     }); 
// }




