import fs from 'fs'
import path from 'path';



const mapFile = new Map();
fs.readdirSync('./threeElement/',{withFileTypes:true}).filter(dir => dir.isDirectory()).map(
    (dir)=>{
        const arry = fs.readdirSync(path.join(process.cwd(),'threeElement',dir.name))
        mapFile.set(dir.name,arry)
    })
    ;
const allFile = []
for (const [key, value] of mapFile) {
    for (const file of value)
    {
        const pathFile = path.join(process.cwd(),'threeElement',key,file)
        allFile.push(pathFile);
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
export {mapAsset,allFile,basenameFile}

