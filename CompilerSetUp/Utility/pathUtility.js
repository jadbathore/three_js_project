import fs from 'fs'
import path from 'path';
import Utility from './Utility.js';
import chalk from 'chalk';


/*
français:
    pathUtility.js permet d'avoir tous le nom et chemin de fichier utile
english:
    pathUtility.js allows to have all the useful file name and path
*/


/*
français:
    map du dossier threeElement les clé sons nom de dossier et les valeur son des array de nom
    exemple :
        (
            setting => [configImport.js,resizing.js...]
            mesh => [cube.js,cube2.js]
        )
English:
    map of the folder threeElement the keys are folder name and the values ​​are arrays of names
    example:
    (
        setting => [configImport.js,resizing.js...]
        mesh => [cube.js,cube2.js]
    )
*/
/**
 * @constant Map of all file key = directory,value = file
 */
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

    //array of the basename 
const basenameFile = []
allFile.forEach((element)=>{
    const base = path.basename(element)
    basenameFile.push(base)
})
// same but excepting the setting name
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


export {mapFile,mapAsset,allFile,basenameFile,allExeceptSetting,basenameExecptSetting,importscript}

