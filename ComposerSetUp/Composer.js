const chalk = require('chalk');
const fs =  require('fs');
const path = require('path');
const Utility = require('./Utility');
const { dir } = require('console');


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

fs.symlink('output.js','output2.js',(err)=>{
    console.log(err)
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




