import fs from 'fs'
import path from 'path';
import Utility from './Utility.js';
import chalk from 'chalk';




const mapFile = new Map();
fs.readdirSync('./threeElement/',{withFileTypes:true}).filter(dir => dir.isDirectory()).map(
    (dir)=>{
        const arry = fs.readdirSync(path.join(process.cwd(),'threeElement',dir.name))
        mapFile.set(dir.name,arry)
    })
    ;
const allFile = []
const allExeceptSetting = []
for (const [key, value] of mapFile) {
    for (const file of value)
    {
        const pathFile = path.join(process.cwd(),'threeElement',key,file)
        allFile.push(pathFile);
        if(key != 'Setting')
        {
            allExeceptSetting.push(pathFile)
        }
    }
}

const pathtoAsset = path.join(process.cwd(),'public','asset')

const mapAsset = new Map();
fs.readdirSync(pathtoAsset,{withFileTypes:true}).filter(dir => dir.isDirectory()).map(
    (dir)=>{
        const arry = fs.readdirSync(path.join(process.cwd(),'public','asset',dir.name))
        mapAsset.set(dir.name,arry)
    })
    ;

const basenameFile = []
allFile.forEach((element)=>{
    const base = path.basename(element)
    basenameFile.push(base)
})
const basenameExecptSetting = []
allExeceptSetting.forEach((element)=>{
    const base = path.basename(element)
    basenameExecptSetting.push(base)
})

const UtilityClass = new Utility(allFile,mapAsset);

const importscript = () =>
{
    for(let i = 0;i< allFile.length;i++)
    {
        if(UtilityClass.addimportScript(allFile[i]) == false)
        {
            console.log(chalk.keyword('yellow')('script import n\'est nécessaire pour le fichier'+allFile[i]))
        }
    } 
    

}

export {mapAsset,allFile,basenameFile,allExeceptSetting,basenameExecptSetting,importscript}

