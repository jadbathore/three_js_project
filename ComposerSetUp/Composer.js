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
const contentCompiler = fs.readFileSync(pathtoCompiler,'utf-8')
const regexgetConst = /(?<=[c][o][n][s][t].)[^{][A-z]*/gm;
const regexgetfunction = /[f][u][n][c][t][i][o][n].[A-z]*/g;

// const allConstinfile = contentCompiler.match(regexgetConst)

// console.log(allConstinfile)

// let exportsScript = 'const {'
// for(let i = 0; i < allConstinfile.length; i++)
//     {
//         exportsScript+=`${allConstinfile[i]},`
//         if(i == allConstinfile.length-1)
//         {
//             exportsScript+= "} = require('../../versionning/linkfile')\n"
//         }
//     }

// for(let i = 0; i < allConstinfile.length; i++)
// {
//     exportsScript+=`module.exports = {${allConstinfile[i]}}\n`
// }

UtilityClass.repopulateComposer()

fs.access(pathtolinkFile,constants.F_OK,async(err)=>{
    if(err != null)
    {
        
        await fs.promises.appendFile(pathtolinkFile,fs.readFileSync(pathtoCompiler))
            .then(()=>{console.log(chalk.green('le fichier linkFile à été crée'))})
            .catch((error)=>{console.log(error)})
    } else {
        let writer = fs.createWriteStream(pathtolinkFile, { 
            flags: 'w'
        }); 
        fs.truncate(pathtolinkFile,0,(err)=>{ 
            if (err){ 
                throw new Error(`erreur truncate ${time} \n${err}`);
            }})
        writer.write(fs.readFileSync(pathtolinkFile))
        writer.write(exportsScript)
    } 
}) 










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




